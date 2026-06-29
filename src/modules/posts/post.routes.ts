import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { postController } from "./post.controller";

const router = Router();

router.post("/",auth(Role.ADMIN,Role.USER),postController.createPost);
router.get("/",postController.getAllPosts);
router.get("/stats",auth(Role.ADMIN),postController.getPostsStatus)
router.get("/my-posts",auth(Role.ADMIN,Role.USER),postController.getMyPosts)
router.get("/:postId",postController.getPostsById)
router.patch("/:postId",auth(Role.ADMIN,Role.USER),postController.updatePost)
router.delete("/:postId",auth(Role.ADMIN,Role.USER),postController.deletePost)


export const postRouters = router;