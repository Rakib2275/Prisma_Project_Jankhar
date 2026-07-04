import { ADDRCONFIG } from "node:dns";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./interface";


const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};


const getAllPosts = async (query : IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page -1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";


  const andConditions : PostWhereInput[] = []

  if(query.searchTerm){
    andConditions.push({
      OR : [
            {
              title : {
                contains : query.searchTerm,
                mode : "insensitive"
              }
            },
            {
              content : {
                contains : query.searchTerm,
                mode : "insensitive"
              }
            }
          ]
    })
    
  }
  if(query.title){
    andConditions.push({
      title : query.title
    })
  }
  if(query.content){
    andConditions.push({
      content : query.content
    })
  }
  if(query.authorId){
    andConditions.push({
      authorId : query.authorId
    })
  }
  if(query.tags){
    andConditions.push({
      tags : {
        hasSome : query.tags as string[]
      }
    })
  }
      if(query.status) {
        andConditions.push({
            status: query.status
        })
    }

  const posts = await prisma.post.findMany({
    //searching / partial match

    // where : {
    //   title : "My Fourth Post"
    // },
    // where : {
    //   title : {
    //     contains : "ronaldo",
    //     mode : "insensitive"
    //   },
    //   content : {
    //     contains : "Ronaldo"
    //   }
    // },

    //combining search and filtering
    // where : {
    //   AND : [
    //     {
    //       OR : [
    //         {
    //           title : {
    //             contains : "Ron",
    //             mode : "insensitive"
    //           }
    //         },
    //         {
    //           content : {
    //             contains : "Ron",
    //             mode : "insensitive"
    //           }
    //         }
    //       ]
    //     },
    //     {
    //       title : "Ronaldo Najario"
    //     },
    //     {
    //       content : "Ronaldo"
    //     }

    //   ]
    // },
    //take : 1,
    // skip : 1,
    // skip : 2,
    //skip : 3,

    // orderBy : {
    //   createdAt : "desc",
    //   title : "asc",
    //   content : "desc"
    // },
    where : {
      AND : andConditions
    },

    // where : {
    //   AND : andConditions
    // },

    take : limit,
    skip : skip,

    orderBy : {
      [sortBy] : sortOrder
    },
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
