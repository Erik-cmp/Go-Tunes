import Header from "@/components/Header";
import LibraryContent from "./components/LibraryContent";
import getSongsByUserId from "@/actions/getSongsByUserId";
import Footer from "@/components/Footer";

const Library = async () => {
  const userSongs = await getSongsByUserId();  

  return (  
    <div 
      className="
        bg-neutral-900                
        md:h-[calc(100%-72px)] h-[calc(100%-50px)]
        w-full
        overflow-hidden
        overflow-y-auto
        rounded-lg        
    ">
      <Header className="from-bg-neutral-900">
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-white text-3xl lg:text-5xl xl:text-6xl font-bold">
            Library
          </h1>          
        </div>
        <LibraryContent songs={userSongs} />
      </Header>  
      <Footer />          
    </div>
  );
}
 
export default Library;