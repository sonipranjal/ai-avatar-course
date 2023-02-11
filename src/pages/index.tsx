import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";

const HomePage = () => {
  const { status, data } = useSession();

  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");

  console.log(data);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-100 via-white to-sky-200"></div>
      <div className="container mx-auto">
        <header className="mx-auto flex w-full max-w-screen-xl justify-between bg-transparent py-4 px-10">
          <div>
            {/* logo */}
            AI AVATAR
          </div>
          <div>
            {/* this is for menu */}

            {status === "authenticated" && (
              <Button onClick={() => signOut()}>Logout</Button>
            )}
          </div>
        </header>
        <div className="m-10 flex flex-col items-center justify-center">
          <div className="bg-gradient-to-br from-black to-slate-600 bg-clip-text text-center text-6xl font-semibold leading-snug text-transparent">
            <p>Create your own</p>{" "}
            <p>
              photorealistic <span className="text-[#3290EE]">AI</span> Avatars
            </p>
          </div>
          <div className="my-12 w-full max-w-2xl">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="w-full transform rounded-full bg-gradient-to-tr from-sky-400 via-lime-300 to-yellow-400 p-1 transition duration-200 active:scale-95"
                  onClick={() => {
                    console.log("open authentication dialog");
                  }}
                >
                  <div className="rounded-full bg-white py-2 tracking-widest ">
                    Create your own AI Avatars Now
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete your authentication</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    console.log(email);

                    try {
                      setAuthLoading(true);
                      await signIn("email", {
                        email: email,
                      });
                    } catch (error) {
                      console.error(error);
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                  className="flex flex-col space-y-4"
                >
                  <Input
                    type={"email"}
                    required
                    placeholder="john@doe.com"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                  <Button type="submit" className="w-full">
                    Verify your email
                  </Button>
                </form>
                <p className="w-full text-center font-bold">OR</p>
                <Button onClick={() => signIn("google")}>
                  <FaGoogle className="mr-2" />
                  Sign In With Google
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
