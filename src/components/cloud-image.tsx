import { api } from "@/utils/api";
import { X } from "lucide-react";
import React from "react";
import { toast } from "react-hot-toast";
import { ImSpinner8 } from "react-icons/im";

type CloudImageProps = {
  s3Key: string;
  url: string;
};

const CloudImage = ({ s3Key, url }: CloudImageProps) => {
  const utils = api.useContext();

  const deleteImageFromS3 = api.storage.removeImageFromS3.useMutation({
    onSuccess: () => {
      toast.success("image deleted from cloud");
      utils.storage.getAllUserUploadedImages.invalidate();
    },
  });

  return (
    <div className="relative m-4 h-[256px] w-[256px]">
      {deleteImageFromS3.isLoading && (
        <div className="absolute inset-0 z-10 flex h-full w-full items-center justify-center bg-black/40">
          <ImSpinner8 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}
      <button
        onClick={() => {
          deleteImageFromS3.mutate({
            key: s3Key,
          });
        }}
        className="absolute top-0 right-0 rounded-xl bg-black/40 p-2 text-white"
      >
        <X className="h-5 w-5" />
      </button>
      <img src={url} alt={""} className="h-full w-full object-cover" />
    </div>
  );
};

export default CloudImage;
