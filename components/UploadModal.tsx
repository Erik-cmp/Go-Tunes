"use client"

import uniqid from "uniqid";
import useUploadModal from "@/hooks/useUploadModal";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

import Modal from "./Modal";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import Input from "./Input";
import Button from "./Button";

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter()

  const getAudioDuration = (file : File) => {
    return new Promise<number>((resolve, reject) => {
      const audio = new Audio();
        
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
        
      audio.addEventListener('error', () => {
        reject(new Error('Could not load file'));
      });
        
      audio.src = URL.createObjectURL(file);
    });
  }

  const {
    register,
    handleSubmit,
    reset
  } = useForm<FieldValues>({
    defaultValues: {
      author: '',
      title: '',
      song: null,
      image: null,
    }
  })

  const onChange = (open: boolean) => {
    if(!open) {
      reset();
      uploadModal.onClose();
    }
  }

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];

      if(!imageFile || !songFile || !user){
        toast.error("Missing fields");
        return;
      }

      const uniqueID = uniqid();   
      let songLength : number = await getAudioDuration(songFile);      
      songLength = Math.round(songLength);
      console.log(songLength);

      // Upload song
      const {
        data: songData,
        error: songError,
      } = await supabaseClient
        .storage
        .from('songs')
        .upload(`song-${uniqueID}`, songFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (songError) {
        setIsLoading(false);        
        console.error("Error uploading song:", songError)
        return toast.error('Failed song upload');
      }

      // Upload image
      const {
        data: imageData,
        error: imageError,
      } = await supabaseClient
        .storage
        .from('images')
        .upload(`image-${uniqueID}`, imageFile, {
          cacheControl: '3600',
          upsert: false
        });      

      if(imageError){
        setIsLoading(false);
        return toast.error('Failed image upload');        
      }

      const {
        error: supabaseError
      } = await supabaseClient
        .from('songs')
        .insert({
          user_id: user.id,
          title: values.title,
          author: values.author,
          image_path: imageData.path,
          song_path: songData.path,
          song_length: songLength
        });

      if(supabaseError){
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.success('Song added!');
      reset();
      uploadModal.onClose();

    } catch (error) {
      toast.error("Whoops, something went wrong!");
    } finally {
      setIsLoading(false)
    }
  }

  return (  
    <Modal
      title="Add a song"
      description=""
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <Input
          id="title"
          disabled={isLoading}
          {...register('title', { required: true })}
          placeholder="Song title"
        />
        <Input
          id="author"
          disabled={isLoading}
          {...register('author', { required: true })}
          placeholder="Song author"
        />
        <div>
          <div className="pb-1">
            Audio file &#40;.mp3&#41;
          </div>
          <Input
          id="song"
          type="file"
          disabled={isLoading}
          accept=".mp3"
          {...register('song', { required: true })}                    
        />          
        </div>
        <div>
          <div className="pb-1">
            Image file
          </div>
          <Input
          id="image"
          type="file"
          disabled={isLoading}
          accept="image/*"
          {...register('image', { required: true })}                    
        />          
        </div> 
        <Button disabled={isLoading} type="submit">
          Add Song
        </Button>               
      </form>
    </Modal>
  );
}
 
export default UploadModal;