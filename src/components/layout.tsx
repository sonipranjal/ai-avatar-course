import { signOut, useSession } from "next-auth/react";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const Layout = ({ children }: React.PropsWithChildren) => {
  const { status, data } = useSession();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-100 via-white to-sky-200"></div>
      <div className="container mx-auto">
        <header className="mx-auto flex w-full max-w-screen-xl justify-between bg-transparent py-4 px-10">
          <Link href={"/"}>
            {/* logo */}
            AI AVATAR
          </Link>
          <div>
            {/* this is for menu */}

            {status === "authenticated" && (
              <Button onClick={() => signOut()}>Logout</Button>
            )}
          </div>
        </header>
      </div>
      {children}
    </div>
  );
};

export default Layout;
