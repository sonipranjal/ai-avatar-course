import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  fetchUserDetails: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      return await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          uniqueKeyword: true,
          credits: true,
          images: true,
        },
      });
    }
  ),
});
