import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env.mjs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/utils/s3";

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
});
