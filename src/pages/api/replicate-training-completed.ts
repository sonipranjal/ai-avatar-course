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

    if (req.body.status !== "succeeded" || !req.body.version) {
      return res.status(400).json({ messge: "model is not trained" });
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        trainerVersion: req.body.version,
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
    if (user.email) {
      await transporter.sendMail({
        from: '"Pranjal from avatars.clubofcoders.com" <pranjal@clubofcoders.com>', // sender address
        to: user.email, // list of receivers
        subject: "Your AI Model training is finished ", // Subject line
        html: `
      <h3>Hey, your model is trained 🎉!</h3>
       <p>Time to create some stunning AI Avatars.</p>

     <p>You are given 50 credits. By using one credit you can use one prompt that will generate upto 4 photos.</p>

     <p>You are identified as <strong>${user.uniqueKeyword}</strong>. When using prompt, mention this unique keyword.</p>

     <p>Example of a good prompt of yours: A closeup portrait shot of person <strong>${user.uniqueKeyword}</strong> in a rugged, outdoor adventurer outfit, exuding confidence and strength, centered, photorealistic digital painting, artstation, concept art, utilizing cutting-edge techniques for sharp focus, naturalistic lighting to bring out the texture of the materials, highly detailed illustration showcasing the gear and accessories, and a bold composition that embodies the spirit of adventure, artgerm style.<p>

     <p>Head over to this URL to start playing around with prompts: <a href="${env.NEXTAUTH_URL}/status">${env.NEXTAUTH_URL}/status</a></p>`,
      });
    }

    return res.status(200).send("success");
  } else {
    res.setHeader("ALLOW", "POST");
    res.status(405).end(`Method ${req.method} not allowed`);
  }
};

export default trainingCompletedHandler;
