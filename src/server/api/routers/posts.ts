import clerkClient from "@clerk/clerk-sdk-node";
import type {User} from "@clerk/nextjs/dist/api";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username || user.firstName,
    profileImageUrl: user.profileImageUrl,
  }
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })).map(filterUserForClient);

    return posts.map(post => {
      const author = users.find(user => user.id == post.authorId);
      if (!author || !author.username) throw new TRPCError( {code: "INTERNAL_SERVER_ERROR", message: "Author for post not found"} );
    console.log(users)
      return {
      post,
      author: {
        ...author,
        username: author.username
      },
    }
  });
  }),
});
