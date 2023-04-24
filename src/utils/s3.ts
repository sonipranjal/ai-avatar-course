import { env } from "@/env.mjs";
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: env.AI_AVATAR_COURSE_AWS_ACCESS_KEY,
    secretAccessKey: env.AI_AVATAR_COURSE_AWS_SECRET_KEY,
  },
});
