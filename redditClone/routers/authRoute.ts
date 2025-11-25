// @ts-nocheck
import express from "express";
import passport from "../middleware/passport";
import { forwardAuthenticated } from "../middleware/checkAuth";

const router = express.Router();
const devMode = process.env.MODE === "dev";

router.get("/login", forwardAuthenticated, (req, res) => {
  const error = req.query.error ? "Invalid username or password" : null;
  res.render("login", { devMode, error });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/posts",
    failureRedirect: "/auth/login?error=1",
  })
);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

export default router;
