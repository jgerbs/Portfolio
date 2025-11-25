// @ts-nocheck
import * as db from "../db";

/* ============================
   GET MULTIPLE POSTS
============================ */
export const getPosts = async (n = 5, sub = undefined) => {
  const posts = await db.getPosts(n, sub);

  // ensure consistent shape
  return posts.map(post => ({
    ...post,
    timestamp: Number(post.timestamp),
    comments: post.comments?.map(c => ({
      ...c,
      timestamp: Number(c.timestamp),
    })) || [],
  }));
};

/* ============================
   GET SINGLE POST
============================ */
export const getPostById = async (id) => {
  const post = await db.getPost(Number(id));
  if (!post) return null;

  return {
    ...post,
    timestamp: Number(post.timestamp),
    comments: post.comments?.map(c => ({
      ...c,
      timestamp: Number(c.timestamp),
    })) || [],
  };
};

/* ============================
   CREATE POST
============================ */
export const createPost = async ({ title, link, description, subgroup, creator }) => {
  const post = await db.addPost(title, link, creator, description, subgroup);

  return {
    ...post,
    timestamp: Number(post.timestamp),
  };
};

/* ============================
   UPDATE POST
============================ */
export const updatePost = async (id, changes) => {
  return db.editPost(Number(id), changes);
};

/* ============================
   DELETE POST
============================ */
export const deletePost = async (id) => {
  return db.deletePost(Number(id));
};

/* ============================
   COMMENTS
============================ */
export const getCommentsForPost = async (postid) => {
  const post = await db.getPost(Number(postid));
  if (!post) return [];

  return post.comments?.map(c => ({
    ...c,
    timestamp: Number(c.timestamp),
  })) || [];
};

export const getCommentById = async (id) => {
  return db.getCommentById(Number(id));
};

export const createComment = async (postid, creator, description) => {
  return db.addComment(Number(postid), creator, description);
};

export const deleteComment = async (id) => {
  return db.deleteComment(Number(id));
};

/* ============================
   VOTES
============================ */
export const setVote = async (postid, userid, value) => {
  return db.setVote(userid, Number(postid), Number(value));
};
