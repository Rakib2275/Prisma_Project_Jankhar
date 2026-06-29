import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config"
import httpStatus from "http-status";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { userRouter } from "./modules/user/user.routes";
import { authRouters } from "./modules/auth/auth.routes";
import { postRouters } from "./modules/posts/post.routes";
import { commentRouters } from "./modules/comments/comment.routes";

const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.get("/",async (req : Request,res:Response) =>{
    // const user = await prisma.user.findMany()
    // console.log(user)
    res.send("Hello World!");
})

app.use("/api/users",userRouter)
app.use("/api/auth",authRouters)
app.use("/api/posts",postRouters)
app.use("/api/comments",commentRouters)

export default app