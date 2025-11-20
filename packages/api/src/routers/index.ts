import { protectedProcedure, publicProcedure, router } from "../index";
import { todoRouter } from "./todo";
import { reposRouter } from "./repos";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	todo: todoRouter,
	repos: reposRouter,
});
export type AppRouter = typeof appRouter;
