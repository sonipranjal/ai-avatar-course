import { env } from "@/env.mjs";
import { prisma } from "@/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

const trainingCompletedHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === "POST") {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ messge: "userid not given" });
    }

    const imagesArray: string[] = req.body.output;

    if (imagesArray && imagesArray?.length > 0) {
      await prisma.image.createMany({
        data: imagesArray.map((url) => ({
          imageUrl: url,
          userId,
        })),
      });
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    // send mail to user to notify them that the training is finished and they can train the models now
    let transporter = nodemailer.createTransport({
      host: env.EMAIL_SERVER_HOST,
      port: Number(env.EMAIL_SERVER_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: env.EMAIL_SERVER_USER, // generated ethereal user
        pass: env.EMAIL_SERVER_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    if (user?.email) {
      await transporter.sendMail({
        from: '"Pranjal from avatars.clubofcoders.com" <pranjal@clubofcoders.com>', // sender address
        to: user.email, // list of receivers
        subject: "Your avatars are generated!!", // Subject line
        html: `
      <h3>Hey, your avatars are generated 🎉!</h3>
       <p>Have a look at <a href="${env.NEXTAUTH_URL}/generate-avatars">${env.NEXTAUTH_URL}/generate-avatars</a>.</p>`,
      });
    }

    return res.status(200).send("success");
  } else {
    res.setHeader("ALLOW", "POST");
    res.status(405).end(`Method ${req.method} not allowed`);
  }
};

export default trainingCompletedHandler;
