"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { FaUserAlt } from "react-icons/fa";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import useGetPlaylistDetail from "@/hooks/useGetPlaylistDetail";
import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import Button from "./Button";
import usePlayer from "@/hooks/usePlayer";
import { TbPlaylist } from "react-icons/tb";
import Vibrant from "node-vibrant";
import useLoadPlaylistImageSingle from "@/hooks/useLoadPlaylistImageSingle";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import useLoadUserImage from "@/hooks/useLoadUserImage";
import Image from "next/image";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  const player = usePlayer();
  const AuthModal = useAuthModal();
  const router = useRouter();

  const supabaseClient = useSupabaseClient();
  const { user } = useUser();
  const userDetail = useUser();

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    player.reset();
    router.refresh();

    if (error) {
      toast.error(error.message);
    }
  };

  const url = typeof window !== "undefined" ? window.location.href : "";
  const id = url.split("/playlist/")[1];
  const playlists = useGetPlaylistDetail(id);
  let imagePath = "";
  if (url.includes("playlist/")) {
    //@ts-ignore
    imagePath = useLoadPlaylistImageSingle(playlists.playlist);
  } else if (url.includes("account")) {
    //@ts-ignore
    imagePath = useLoadUserImage(userDetail?.userDetails?.avatar_url);
  }
  const userImagePath = useLoadUserImage(
    userDetail?.userDetails?.avatar_url as string
  );

  const [backgroundColor, setBackgroundColor] = useState(
    "linear-gradient(to bottom, #1E40AF, transparent)"
  );

  useEffect(() => {
    const checkPath = () => {
      const currentPath = window.location.pathname;
      const isPlaylistPage =
        currentPath.includes("playlist/") || currentPath.includes("account");
      const isSearchOrLibraryPage =
        currentPath.includes("search") || currentPath.includes("library");

      if (imagePath) {
        let v = Vibrant.from(imagePath);
        v.getPalette().then((palette) => {
          setBackgroundColor(
            isSearchOrLibraryPage
              ? "transparent"
              : isPlaylistPage
              ? `linear-gradient(to bottom, ${palette.Vibrant?.hex}, transparent)`
              : "linear-gradient(to bottom, #1E40AF, transparent)"
          );
        });
      } else {
        setBackgroundColor(
          isSearchOrLibraryPage
            ? "transparent"
            : isPlaylistPage
            ? `linear-gradient(to bottom, #1E40AF, transparent)`
            : "linear-gradient(to bottom, #1E40AF, transparent)"
        );
      }
    };

    checkPath();

    const handleRouteChange = () => {
      checkPath();
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [imagePath]);

  return (
    <div
      className={twMerge(
        `
      h-fit      
      md:p-6 p-4       
      bg-gradient-to-b
      from-blue-700                 
    `,
        className
      )}
      style={{ background: backgroundColor }}
    >
      <div
        className="
        w-full
        mb-4
        flex
        items-center
        justify-between
      "
      >
        <div
          className="
          hidden
          lg:flex
          gap-x-2
          items-center
        "
        >
          <Tippy
            content={
              <div style={{ fontWeight: "600", fontSize: "0.75rem" }}>
                Go Back
              </div>
            }
            delay={[100, 0]}
            placement="top"
            popperOptions={{
              modifiers: [{ name: "flip", enabled: false }],
            }}
            touch={false}
          >
            <button
              onClick={() => window.history.back()}
              className={`
            rounded-full
            bg-black
            flex
            items-center
            justify-center
            hover:opacity-75
            transition            
          `}
            >
              <RxCaretLeft className="text-white" size={35} />
            </button>
          </Tippy>

          <Tippy
            content={
              <div style={{ fontWeight: "600", fontSize: "0.75rem" }}>
                Go Forward
              </div>
            }
            delay={[100, 0]}
            placement="top"
            popperOptions={{
              modifiers: [{ name: "flip", enabled: false }],
            }}
            touch={false}
          >
            <button
              onClick={() => router.forward()}
              className="
            rounded-full
            bg-black
            flex
            items-center
            justify-center
            hover:opacity-75
            transition
          "
            >
              <RxCaretRight className="text-white" size={35} />
            </button>
          </Tippy>
        </div>
        <div className="flex lg:hidden gap-x-2 items-center">
          <button
            onClick={() => router.push("/")}
            className="
              rounded-full
              p-2
              bg-white
              flex
              items-center
              justify-center
              hover:opacity-75
              transition
            "
          >
            <HiHome className="text-black" size={20} />
          </button>
          <button
            onClick={() => router.push("/search")}
            className="
              rounded-full
              p-2
              bg-white
              flex
              items-center
              justify-center
              hover:opacity-75
              transition
            "
          >
            <BiSearch className="text-black" size={20} />
          </button>
          <button
            onClick={() => {
              if (!user) {
                return AuthModal.onOpen();
              }

              router.push("/library");
            }}
            className="
              rounded-full
              p-2
              bg-white
              flex
              items-center
              justify-center
              hover:opacity-75
              transition
            "
          >
            <TbPlaylist className="text-black" size={20} />{" "}
          </button>
        </div>
        <div
          className="
          flex
          justify-between
          items-center
          gap-x-4
        "
        >
          {user ? (
            <div
              className="
              flex gap-x-4
              items-center
            "
            >
              <Button onClick={handleLogout} className="bg-white px-6 py-2">
                Logout
              </Button>

              <Tippy
                content={
                  <div style={{ fontWeight: "600", fontSize: "0.75rem" }}>
                    Go to Profile Page
                  </div>
                }
                delay={[100, 0]}
                placement="top"
                popperOptions={{
                  modifiers: [{ name: "flip", enabled: false }],
                }}
                touch={false}
              >
                <div
                  className="
                relative
                h-10
                w-10  
                aspect-square                                         
                rounded-full
                cursor-pointer
                hover:opacity-75
                transition                                              
                "
                  onClick={() => router.push("/account")}
                >
                  {userImagePath ? (
                    <Image
                      fill
                      alt="Playlist"
                      className="object-cover rounded-full border-2 border-white"
                      src={
                        userImagePath ? userImagePath : `/images/profile.png`
                      }
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex items-center justify-center rounded-full w-full h-full bg-white text-black">
                      <FaUserAlt />
                    </div>
                  )}
                </div>
              </Tippy>
            </div>
          ) : (
            <>
              <div className="hidden lg:flex">
                <Button
                  onClick={AuthModal.onOpen}
                  className="
                  bg-transparent
                  text-neutral-300
                  font-medium                  
                "
                >
                  Sign up
                </Button>
              </div>
              <div>
                <Button
                  onClick={AuthModal.onOpen}
                  className="
                bg-white
                px-6
                py-2
                "
                >
                  Log in
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default Header;
