import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { commentController } from "./comment.controller";

const router = Router();

router.post( 
    "/",
    auth(Role.USER, Role.ADMIN),
    commentController.createComment
);

router.get(
    "/:commentId",
    commentController.getCommentByPostId
);

router.patch(
    "/:commentId",
    auth(Role.USER, Role.ADMIN),
    commentController.updateComment
);

router.delete(
    "/:commentId",
    auth(Role.USER, Role.ADMIN),
    commentController.deleteComment
);

router.put(
    "/:commentId/moderate",
    auth(Role.ADMIN),
    commentController.moderateComment
);


export const commentRoutes = router;