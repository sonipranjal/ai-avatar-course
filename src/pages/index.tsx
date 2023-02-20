import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";
import { ChevronRight } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";

const HomePage = () => {
  const { status, data } = useSession();

  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");

  const router = useRouter();

  const checkout = api.stripe.checkout.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) router.push(data.checkoutUrl);
    },
  });

  const paymentStatus = api.stripe.getPaymentStatus.useQuery();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast.success(
        "Payment succeeded! You will receive an email confirmation."
      );
    }

    if (query.get("canceled")) {
      toast.error("Payment failed.");
    }
  }, []);

  return (
    <Layout>
      <div className="m-10 flex flex-col items-center justify-center">
        <div className="bg-gradient-to-br from-black to-slate-600 bg-clip-text text-center text-6xl font-semibold leading-snug text-transparent">
          <p>Create your own</p>{" "}
          <p>
            photorealistic <span className="text-[#3290EE]">AI</span> Avatars
          </p>
        </div>
        <div className="my-12 w-full max-w-2xl">
          {status === "unauthenticated" && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full transform rounded-full bg-gradient-to-tr from-sky-400 via-lime-300 to-yellow-400 p-1 transition duration-200 active:scale-95">
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
          )}

          <div className="relative flex w-full justify-center">
            {status == "authenticated" && (
              <Button
                className="group w-full"
                onClick={() => {
                  paymentStatus.data?.isPaymentSucceeded
                    ? router.push("/dashboard")
                    : checkout.mutate();
                }}
              >
                {paymentStatus.data?.isPaymentSucceeded
                  ? "Go to your dashboard"
                  : "Checkout"}
                <ChevronRight className="ml-2 transition group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
