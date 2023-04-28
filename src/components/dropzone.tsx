import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { nanoid } from "nanoid";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "@/utils/api";
import axios from "axios";
import { toast } from "react-hot-toast";
import ImageBlobReducer from "image-blob-reduce";

//@ts-ignore
import Pica from "pica";

const pica = Pica({ features: ["js", "wasm", "cib"] });
const ImageReducer = new ImageBlobReducer({ pica });

type FILE_WITH_PREVIEW = File & { preview: string; id: string };

const Dropzone = () => {
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [files, setFiles] = useState<FILE_WITH_PREVIEW[]>([]);

  const getAllUserUploadedImages =
    api.storage.getAllUserUploadedImages.useQuery();

  const triggerProcessingImages =
    api.images.startProcessingImages.useMutation();

  const utils = api.useContext();

  const getUploadUrls = api.storage.getUploadUrls.useMutation({
    onSuccess: async (data) => {
      try {
        setIsUploadingImages(true);

        // now reduce the images size
        // why we are reducing the size?
        // when the user is uploaded all their images -> we have to start a background process

        const resizedImages: Blob[] = [];

        for (const photo of files) {
          const resizedBlob = await ImageReducer.toBlob(
            new Blob([photo], {
              type: "image/jpeg",
            }),
            { max: 1000 }
          );
          resizedImages.push(resizedBlob);
        }

        const uploadPromises = data.map((uploadUrl, i) => {
          return axios.put(uploadUrl, resizedImages[i]);
        });

        await Promise.all(uploadPromises);
        utils.storage.getAllUserUploadedImages.invalidate();
        // we should trigger processing images on the backend side
        triggerProcessingImages.mutate();
      } catch (error) {
        toast.error("uploading images failed");
      } finally {
        setIsUploadingImages(false);
      }
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpg": [".jpg"],
      "image/jpeg": [".jpeg"],
    },
    onDrop: (acceptedFiles) => {
      const allSelectedFiles = [
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
            id: nanoid(),
          })
        ),
        ...files,
      ];

      // check already uploaded images count and adjust the number of remaining images accordingly
      const canUploadNow =
        getAllUserUploadedImages.data?.uploadedImagesWithKeys.length;

      allSelectedFiles.splice(10 - (canUploadNow ?? 0));

      setFiles(allSelectedFiles);
    },
    maxFiles: 10,
  });

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <>
      <section className="mx-auto flex h-full w-full flex-col space-y-4 p-10">
        <div
          {...getRootProps()}
          className="flex items-center justify-center rounded-xl border border-dashed border-black bg-slate-200 p-10 hover:bg-black/10"
        >
          <input {...getInputProps()} className="h-full w-full" />
          <p className="text-gray-400">
            Drag 'n' drop 3 to 10 images here, or click to select files
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center">
          {files &&
            files.length > 0 &&
            files.map((file) => (
              <div key={file.id} className="relative m-4 h-[256px] w-[256px]">
                <button
                  onClick={() => {
                    setFiles((pre) => pre.filter((img) => img.id !== file.id));
                  }}
                  className="absolute top-0 right-0 rounded-xl bg-black/40 p-2 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
        </div>
      </section>
      {files && files.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-center bg-black/50 p-10">
          <div>
            <Button
              disabled={isUploadingImages}
              onClick={() => {
                getUploadUrls.mutate({
                  images: files.map((file) => ({ imageId: file.id })),
                });
              }}
            >
              {isUploadingImages ? "Loading..." : "Upload Images"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dropzone;
