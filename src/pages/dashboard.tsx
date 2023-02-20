import Layout from "@/components/layout";
import { useDropzone } from "react-dropzone";
import { cn } from "@/utils/cn";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const Dashboard = () => {
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: {
        "image/*": [".jpeg", ".png", ".jpg"],
      },
      onDrop: (acceptedFiles) => {
        setFiles((prev) => [
          ...prev,
          ...acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          ),
        ]);
      },
      maxFiles: 15,
      //   10 MB
      maxSize: 10 * 10000000,
    });

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <Layout>
      <div className="flex h-full w-full flex-col items-center">
        <div className="m-4 w-full max-w-2xl p-4">
          <div
            {...getRootProps()}
            className={cn(
              "flex h-52 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-400 bg-slate-200 p-10 text-center hover:bg-slate-300",
              isDragAccept && "border-green-500 bg-green-100",
              isDragReject && "border-red-500 bg-red-100 text-white",
              isFocused && "border-black"
            )}
          >
            <input {...getInputProps()} />
            <p className="text-lg font-medium">
              Drag 'n' drop some close up selfies here, or click to select files
            </p>
          </div>
          <div className="my-6 flex w-full flex-wrap items-center justify-center">
            {files &&
              files.map((file) => (
                <div
                  className="relative m-4 h-44 w-44 select-none rounded-xl"
                  key={file.name}
                >
                  <div
                    className="absolute right-0 top-0 transform cursor-pointer rounded-xl bg-black/50 p-2 transition active:scale-95"
                    onClick={() => {
                      setFiles((prev) =>
                        prev.filter((img) => img.name !== file.name)
                      );
                    }}
                  >
                    <X className="h-5 w-5 text-white" />
                  </div>
                  <img
                    src={file.preview}
                    className="h-full w-full rounded-xl object-cover"
                    // Revoke data uri after image is loaded
                    onLoad={() => {
                      URL.revokeObjectURL(file.preview);
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
