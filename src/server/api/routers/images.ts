import { createTRPCRouter, protectedProcedure } from "../trpc";
import smartcrop from "smartcrop-sharp";
import sharp from "sharp";
import { getAllUserImagesSignedUrls } from "./storage";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import JSZip from "jszip";
import { s3 } from "@/utils/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env.mjs";

const WIDTH = 512;
const HEIGHT = 512;

const zip = new JSZip();

export const imagesRouter = createTRPCRouter({
  startProcessingImages: protectedProcedure.mutation(
    async ({ ctx: { session } }) => {
      // get all images of user

      const images = await getAllUserImagesSignedUrls(session.user.id);

      if (!images) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "processing images failed",
        });
      }

      const folder = zip.folder("data");

      for (const imageObj of images.uploadedImagesWithKeys) {
        if (imageObj?.url) {
          const response = await axios.get(imageObj?.url, {
            responseType: "arraybuffer",
          });

          const result = await smartcrop.crop(response.data, {
            width: WIDTH,
            height: HEIGHT,
          });

          const photoBuffer = await sharp(response.data)
            .extract({
              width: result.topCrop.width,
              height: result.topCrop.height,
              left: result.topCrop.x,
              top: result.topCrop.y,
            })
            .resize(WIDTH, HEIGHT)
            .toBuffer();

          folder?.file(imageObj.key, photoBuffer, {
            binary: true,
          });
        }
      }

      const zipFile = await folder?.generateAsync({
        type: "nodebuffer",
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: env.AI_AVATAR_COURSE_AWS_BUCKET_NAME,
          Key: `uploads/${session.user.id}/data.zip`,
          ContentType: "application/zip",
          Body: zipFile,
        })
      );
    }
  ),
});
