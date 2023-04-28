import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const GenerateAvatars = () => {
  const checkModelTrainingStatus =
    api.replicate.checkModelTrainingStatus.useQuery();

  const userData = api.user.fetchUserDetails.useQuery(undefined, {
    // Refetch the data every 10 second
    refetchInterval: 15 * 1000,
  });

  const generateAvatars = api.replicate.generateAvatars.useMutation({
    onSuccess: () => {
      toast.success("your avatars will be generated in 2 to 4 minutes");
      setPrompt("");
    },
    onError: (err) => {
      toast.error(err.message.slice(0, 150));
    },
  });

  const [prompt, setPrompt] = useState("");

  return (
    <Layout>
      <div className="flex h-full w-full flex-col items-center justify-center space-y-6">
        {checkModelTrainingStatus.isLoading && userData.isLoading && (
          <div className="rounded-xl bg-black/30 p-4">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        )}

        {checkModelTrainingStatus.data && (
          <div className="text-3xl font-semibold">
            Model Status:{" "}
            <span
              className={cn(
                checkModelTrainingStatus.data === "succeeded" &&
                  "text-green-500",
                "capitalize"
              )}
            >
              {checkModelTrainingStatus.data}
            </span>
          </div>
        )}

        {userData.isSuccess && (
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
            <div className="text-xl">
              You have{" "}
              <span className="font-bold">{userData.data?.credits}</span>{" "}
              credits remaining!
            </div>
            <div className="text-lg">
              Your unique keyword is{" "}
              <span className="font-bold">{userData.data?.uniqueKeyword}</span>.
            </div>
          </div>
        )}

        {checkModelTrainingStatus.isSuccess &&
          checkModelTrainingStatus.data === "succeeded" && (
            <div className="flex w-full items-center justify-center">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(prompt);
                  generateAvatars.mutate({
                    prompt,
                  });
                }}
                className="flex w-full max-w-lg flex-col space-y-4 shadow-md"
              >
                <div>
                  <p className="text-xs text-gray-700">Prompt Demo</p>
                  <p className="text-sm text-gray-900">
                    A closeup portrait shot of person{" "}
                    {userData.data?.uniqueKeyword ?? "xyz"} in a rugged, outdoor
                    adventurer outfit, exuding confidence and strength,
                    centered, photorealistic digital painting, artstation,
                    concept art, utilizing cutting-edge techniques for sharp
                    focus, naturalistic lighting to bring out the texture of the
                    materials, highly detailed illustration showcasing the gear
                    and accessories, and a bold composition that embodies the
                    spirit of adventure, artgerm style.
                  </p>
                </div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-36 w-full"
                  placeholder={`A closeup portrait shot of person ${
                    userData.data?.uniqueKeyword ?? "xyz"
                  } in a rugged, outdoor adventurer outfit, exuding confidence and strength, centered, photorealistic digital painting, artstation, concept art, utilizing cutting-edge techniques for sharp focus, naturalistic lighting to bring out the texture of the materials, highly detailed illustration showcasing the gear and accessories, and a bold composition that embodies the spirit of adventure, artgerm style.`}
                />
                <Button disabled={generateAvatars.isLoading} type="submit">
                  Generate Avatars
                </Button>
              </form>
            </div>
          )}

        {userData.isSuccess && userData.data?.images && (
          <div>
            <div className="flex flex-wrap items-center justify-center">
              {userData.data?.images.map((image) => (
                <div
                  key={image.id}
                  className="relative m-4 h-[256px] w-[256px]"
                >
                  <img
                    src={image.imageUrl}
                    alt={""}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GenerateAvatars;
