// @ts-nocheck
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {
  getUserByEmailIdAndPassword,
  getUserById
} from "../controller/userController";

passport.use(
  new LocalStrategy(
    {
      usernameField: "uname",     // matches login.ejs
      passwordField: "password",  // matches login.ejs
    },
    async (uname, password, done) => {
      try {
        const user = await getUserByEmailIdAndPassword(uname, password);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

export default passport;
