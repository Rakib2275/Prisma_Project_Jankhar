import { PostStatus } from "../../../generated/prisma/enums";

export interface ICreatePostPayload{
    title : string;
    content : string;
    thumbnail ?: string;
    isFeatured ?: boolean;
    status ?: PostStatus;
    tags : string[]
}

export interface IUpdatePostPayload {
    title ?: string;
    content ?: string;
    thumbnail ?: string;
    isFeatured ?: boolean;
    status ?: PostStatus;
    tags ?: string[]
}

export interface IPostQuery extends IUpdatePostPayload{
  title ?: string
  content ?: string
  searchTerm ?: string
  page ?: string
  limit ?: string
  sortOrder ?: string
  sortBy ?: string
  authorId ?: string
}