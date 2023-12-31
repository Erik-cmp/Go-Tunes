"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@supabase/auth-helpers-react";
import { useRef } from "react";

interface ListItemProps {
  image: string;
  name: string;  
  href: string;
  variant: string;
}

const ListItem: React.FC<ListItemProps> = ({
  image,
  name,  
  href,
  variant,
}) => {
  const router = useRouter();
  const authModal = useAuthModal();
  const user = useUser();
  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }

    if (href === "liked") {
      router.push("liked");
    } else {
      const newPath = `/playlist/${href}`;
      router.replace(newPath);
    }
  };

  let lastTouchTime = 0;

  const handleTouchStart = () => {
    console.log("im called");
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastTouchTime;

    if (timeDiff < 500) {
      console.log("called");
      onClick();
    }

    lastTouchTime = currentTime;
  };

  if (variant === "1") {
    return (
      <button
        onClick={onClick}
        onTouchStart={() => handleTouchStart()}
        className="
        relative
        group
        flex
        items-center
        rounded-md
        overflow-hidden
        md:gap-x-4
        gap-x-2
        bg-neutral-100/10
        hover:bg-neutral-100/20
        transition
        md:pr-4
        pr-2
      "
      >
        <div
          className="
          relative
          md:min-h-[64px]
          md:min-w-[64px]
          min-h-[48px]
          min-w-[48px]
        "
        >
          <Image className="object-cover" fill src={image} alt="Image" />
        </div>
        <p className="font-semibold truncate md:py-4 md:text-lg text-sm">
          {name}
        </p>
      </button>
    );
  } else if (variant === "2") {
    return (
      <button
        onClick={onClick}
        onTouchStart={() => handleTouchStart()}
        className="
        relative
        group
        flex
        items-center
        rounded-md
        overflow-hidden
        gap-x-3        
        hover:bg-neutral-100/10
        transition
        p-1.5               
      "
      >
        <div
          className="
          relative
          min-h-[48px]
          min-w-[48px]
          overflow-hidden
          rounded-md                    
        "
        >
          <Image
            className="object-cover"
            fill
            sizes="48px"
            src={image}
            alt="Image"
          />
        </div>
        <div className="flex flex-col w-full truncate">
          <p className="font-medium truncate w-full items-start text-start">{name}</p>
        </div>
      </button>
    );
  }
};

export default ListItem;
