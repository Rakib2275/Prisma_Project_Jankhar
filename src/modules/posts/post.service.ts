import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IUpdatePostPayload } from "./interface";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return posts;
};

const getPostsById = async (postId: string) => {
  // await prisma.post.update({
  //     where : {
  //         id : postId,
  //     },
  //     data : {
  //         views : {
  //             increment : 1
  //         }
  //     }
  // })

  // const post = await prisma.post.findUniqueOrThrow({
  //     where : {
  //         id : postId
  //     },
  //     include : {
  //         author:{
  //             omit : {
  //                 password: true
  //             }
  //         },
  //         comments:{
  //             where:{
  //                 status: CommentStatus.APPROVED
  //             },
  //             orderBy:{
  //                 createdAt: "desc"
  //             }
  //         },
  //         _count:{
  //             select:{
  //                 comments: true
  //             }
  //         }
  //     }
  // })

  // return post

  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
        where : {
            id : postId,
        },
        data : {
            views : {
                increment : 1
            }
        }
    })
    // throw new Error("fake error")
    const post = await tx.post.findUniqueOrThrow({
        where : {
          id : postId
      },
      include : {
          author:{
              omit : {
                  password: true
              }
          },
          comments:{
              where:{
                  status: CommentStatus.APPROVED
              },
              orderBy:{
                  createdAt: "desc"
              }
          },
          _count:{
              select:{
                  comments: true
              }
          }
        }
    })
    return post
  });
  return transactionResult
};

const getMyPosts = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  return result;
};

const updatePost = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this post!");
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this post!");
  }

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

const getPostsStatus =async () => {
    const transctionResult = await prisma.$transaction(
        async(tx) =>{
            // const totalPosts = await tx.post.count();

            // const totalPublishedPost = await tx.post.count({
            //     where:{
            //         status: PostStatus.ACTIVED
            //     }
            // })

            // const totalDraftPosts = await tx.post.count({
            //     where : {
            //         status : PostStatus.DRAFT
            //     }
            // })

            // const totalArchivedPost = await tx.post.count({
            //     where : {
            //         status : PostStatus.ARCHIVED
            //     }
            // })

            // const totalComments = await tx.comment.count();

            // const totalApprovedComments = await tx.comment.count({
            //     where : {
            //         status : CommentStatus.APPROVED
            //     }
            // })

            // const totalRejectComments = await tx.comment.count({
            //     where : {
            //         status : CommentStatus.REJECT
            //     }
            // })

            // const totalPostViewsAggregate = await tx.post.aggregate({
            //     _sum : {
            //         views : true
            //     }
            // })

            // const totalPostViews = totalPostViewsAggregate._sum.views;


            // return{
            //     totalPosts,
            //     totalPublishedPost,
            //     totalApprovedComments,
            //     totalRejectComments,
            //     totalComments,
            //     totalArchivedPost,
            //     totalDraftPosts,
            //     totalPostViews
            // }

            const [
                totalPosts,
                totalPublishedPost,
                totalApprovedComments,
                totalRejectComments,
                totalComments,
                totalArchivedPost,
                totalDraftPosts,
                totalPostViewsAggregate
            ] = await Promise.all([
                await tx.post.count(),

                await tx.post.count({
                    where:{
                        status: PostStatus.ACTIVED
                    }
                }),
                await tx.post.count({
                where : {
                    status : PostStatus.DRAFT
                }
            }),
            await tx.post.count({
                where : {
                    status : PostStatus.ARCHIVED
                }
            }),
            await tx.comment.count(),

            await tx.comment.count({
                where : {
                    status : CommentStatus.APPROVED
                }
            }),
            await tx.comment.count({
                where : {
                    status : CommentStatus.REJECT
                }
            }),
            await tx.post.aggregate({
                _sum : {
                    views : true
                }
            })

            ])

            return {
                totalPosts,
                totalPublishedPost,
                totalApprovedComments,
                totalRejectComments,
                totalComments,
                totalArchivedPost,
                totalDraftPosts,
                totalPostViews : totalPostViewsAggregate._sum.views
            }
        }
    )

    return transctionResult
};

export const postService = {
  createPost,
  getAllPosts,
  getPostsById,
  updatePost,
  deletePost,
  getPostsStatus,
  getMyPosts,
};
