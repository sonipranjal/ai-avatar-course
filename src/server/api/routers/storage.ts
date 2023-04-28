import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "@/env.mjs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/utils/s3";
import { TRPCError } from "@trpc/server";

export const getAllUserImagesSignedUrls = async (userId: string) => {
  const pathToImages = `uploads/${userId}`;

  const data = await s3.send(
    new ListObjectsV2Command({
      Bucket: env.AI_AVATAR_COURSE_AWS_BUCKET_NAME,
      Prefix: pathToImages,
    })
  );

  if (!data || !data.Contents) {
    return;
  }

  const allImagesSignedUrls = await Promise.all(
    data.Contents.map((photo) => photo.Key).map((Key) =>
      getSignedUrl(
        s3,
        new GetObjectCommand({
          Key,
          Bucket: env.AI_AVATAR_COURSE_AWS_BUCKET_NAME,
        }),
        {
          expiresIn: 60 * 5,
        }
      )
    )
  );

  const returnedObjectWithKeys = allImagesSignedUrls.map((url, i) => {
    if (data.Contents && data.Contents[i]) {
      const key = data.Contents[i]?.Key;

      if (key && key.split(".").pop() === "jpeg") {
        return {
          url,
          key,
        };
      }
    }
  });

  return {
    uploadedImagesWithKeys: returnedObjectWithKeys,
  };
};

export const storageRouter = createTRPCRouter({
  getUploadUrls: protectedProcedure
    .input(
      z.object({
        images: z.array(
          z.object({
            imageId: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx: { session }, input: { images } }) => {
      const putCommands = images.map((img) => {
        const Key = `uploads/${session.user.id}/${img.imageId}.jpeg`;
        return new PutObjectCommand({
          Bucket: env.AI_AVATAR_COURSE_AWS_BUCKET_NAME,
          Key,
          ContentType: "image/jpeg",
        });
      });

      const getSignedUrls = await Promise.all(
        putCommands.map((command) =>
          getSignedUrl(s3, command, {
            expiresIn: 60 * 2,
          })
        )
      );

      return getSignedUrls;
    }),

  getAllUserUploadedImages: protectedProcedure.query(
    async ({ ctx: { session } }) => {
      const imagesSignedUrls = await getAllUserImagesSignedUrls(
        session.user.id
      );

      return imagesSignedUrls;
    }
  ),

  removeImageFromS3: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ input: { key } }) => {
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: env.AI_AVATAR_COURSE_AWS_BUCKET_NAME,
        Key: key,
      });

      try {
        await s3.send(deleteObjectCommand);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "something wrong with s3",
        });
      }
    }),
});
