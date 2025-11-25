// const { ensureAuthenticated } = require("../middleware/checkAuth");
import express from "express";
import * as database from "../db";
const router = express.Router();

router.get("/list", async (req, res) => {
  const subs = await database.getSubs();
  subs.sort();

  const user = req.user;
  res.render("subs", { subs, user });
});

router.get("/show/:subname", async (req, res) => {
  const subname: string = req.params.subname;
  const posts = await database.getPosts(50, subname);

  const user = req.user;
  res.render("sub", { subname, posts, user });
});

export default router;
