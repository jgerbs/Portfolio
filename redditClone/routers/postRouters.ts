// @ts-nocheck
import express from "express";
import { ensureAuthenticated } from "../middleware/checkAuth";
import * as database from "../controller/postController";
import { error } from "console";

const router = express.Router();

// HOME
router.get("/", async (req, res) => {
  const posts = await database.getPosts(20);
  const user = req.user;
  res.render("posts", { posts, user });
});

// CREATE FORM
router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("createPosts", { user: req.user, errors: [], formData: {} });
});

// CREATE POST
router.post("/create", ensureAuthenticated, async (req, res) => {
  const { title, link, description, sub } = req.body;

  const creator = req.user.id;
  const errors = [];

  // VALIDATION
  if (!title?.trim()) {
    errors.push("Title is required.");
  }

  if (!sub?.trim()) {
    errors.push("Subgroup is required.");
  }

  if (!link?.trim() && !description?.trim()) {
    errors.push("You must provide a link OR a description.");
  }

  // If validation fails → re-render form with error + input values
  if (errors.length > 0) {
    return res.render("createPosts", {
      user: req.user,
      errors,
      formData: { title, link, description, sub }
    });
  }

  // SUCCESS
  const post = await database.createPost({
    title,
    link,
    description,
    subgroup: sub,
    creator
  });

  res.redirect(`/posts/show/${post.id}`);
});

// SHOW POST
router.get("/show/:postid", async (req, res) => {
  const post = await database.getPostById(req.params.postid);

  if (!post) return res.status(404).send("Post not found");

  const comments = await database.getCommentsForPost(req.params.postid);
  const user = req.user;

  res.render("individualPost", { post, comments, user });
});

// EDIT FORM
router.get("/edit/:postid", ensureAuthenticated, async (req, res) => {
  const post = await database.getPostById(req.params.postid);

  if (!post) return res.status(404).send("Post not found");
  if (post.creator.id !== req.user.id) return res.status(403).send("Not authorized");

  res.render("editPost", {
    post,
    user: req.user,
    errors: [],
    formData: {
      title: post.title,
      link: post.link,
      description: post.description,
    }
  });
});

// UPDATE POST
router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  const { title, link, description } = req.body;

  const post = await database.getPostById(req.params.postid);
  if (!post) return res.status(404).send("Post not found");
  if (post.creator.id !== req.user.id) return res.status(403).send("Not authorized");

  const errors = [];

  // VALIDATION
  if (!title?.trim()) errors.push("Title is required.");
  if (!link?.trim() && !description?.trim()) {
    errors.push("You must provide a link OR a description.");
  }

  // If invalid, re-render with warnings
  if (errors.length > 0) {
    return res.render("editPost", {
      user: req.user,
      post,
      errors,
      formData: { title, link, description }
    });
  }

  // SUCCESS
  await database.updatePost(req.params.postid, {
    title,
    link,
    description
  });

  res.redirect(`/posts/show/${req.params.postid}`);
});


// DELETE CONFIRM
router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req, res) => {
  const post = await database.getPostById(req.params.postid);

  if (!post) return res.status(404).send("Post not found");
  if (post.creator.id !== req.user.id) return res.status(403).send("Not authorized");

  res.render("deleteConfirm", { post, user: req.user });
});

// DELETE POST
router.post("/delete/:postid", ensureAuthenticated, async (req, res) => {
  const post = await database.getPostById(req.params.postid);

  if (!post) return res.status(404).send("Post not found");
  if (post.creator.id !== req.user.id) return res.status(403).send("Not authorized");

  const subgroup = post.subgroup;

  await database.deletePost(req.params.postid);

  res.redirect(`/subs/show/${subgroup}`);
});

// CREATE COMMENT
router.post("/comment-create/:postid", ensureAuthenticated, async (req, res) => {
  const { description } = req.body;

  if (!description) return res.status(400).send("Comment cannot be empty.");

  await database.createComment(
    req.params.postid,
    req.user.id,
    description
  );

  res.redirect(`/posts/show/${req.params.postid}`);
});

// DELETE COMMENT
router.post("/comment-delete/:commentid", ensureAuthenticated, async (req, res) => {
  const commentId = Number(req.params.commentid);
  const comment = await database.getCommentById(commentId);

  if (!comment) return res.status(404).send("Comment not found");
  if (comment.creator !== req.user.id) return res.status(403).send("Not authorized");

  const postId = comment.post_id;

  await database.deleteComment(req.params.commentid);

  res.redirect(`/posts/show/${postId}`);
});


// SET VOTE
router.post("/vote/:postid", ensureAuthenticated, async (req, res) => {
  const postid = req.params.postid;
  const userid = req.user.id;
  const value = Number(req.body.setvoteto);

  await database.setVote(postid, userid, value);

  const backTo = req.get("Referrer") || `/posts/show/${postid}`;
  res.redirect(backTo);
});

export default router;
