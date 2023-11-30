"use client"

import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { IoAddCircleOutline, IoRemoveCircleOutline, IoCheckmarkCircle } from "react-icons/io5";
import toast from "react-hot-toast";

interface LikeButtonProps {
  songId: string;
  songTitle: string;
  size: number;
  variant: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  songId,
  songTitle,
  size,
  variant
}) => {
  const router = useRouter();
  const { supabaseClient } = useSessionContext();

  const authModal = useAuthModal();
  const { user } = useUser();

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if(!user?.id){
      return;
    }

    const fetchData = async () => {
      const { data, error } = await supabaseClient
        .from('liked_songs')
        .select('*')
        .eq('user_id', user.id)
        .eq('song_id', songId)
        .single()

      if(!error && data){
        setIsLiked(true);
      }
    };

    fetchData();
  }, [songId, supabaseClient, user?.id]);

  const Icon = isLiked ? (variant == 1 ? IoCheckmarkCircle : IoRemoveCircleOutline ) : IoAddCircleOutline;

  const handleLike = async () => {
    if(!user) {
      return authModal.onOpen();
    }

    if(isLiked){
      const { error } = await supabaseClient
        .from('liked_songs')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', songId)
      
      if(error){
        toast.error(error.message);
      } else {
        setIsLiked(false);
      }
    } else {
      const { error } = await supabaseClient
        .from('liked_songs')
        .insert({
          song_id: songId,
          user_id: user.id
        });

      if(error){
        toast.error(error.message);
      } else {
        setIsLiked(true);
        toast.success(`${songTitle} added to favorites!`)
      }
    }    

    router.refresh();
  }

  return (
    <button 
      onClick={handleLike}      
      className="
        hover:opacity-75
        transition      
      "
    >
      <Icon color={variant === 1 ? (isLiked ? '#3B82F6' : 'white') : '#a3a3a3'} size={size}/>
    </button>
  );
  
}
 
export default LikeButton;