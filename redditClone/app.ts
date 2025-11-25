// @ts-nocheck
import express from "express";
import session from "express-session";
import passport from "./middleware/passport";
import path from "path";
import expressLayouts from "express-ejs-layouts";

const PORT = process.env.PORT || 8000;
const app = express();

// VIEW ENGINE + LAYOUTS
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// SESSION
app.set("trust proxy", 1);
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// BODY PARSING
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// ROUTES
import indexRoute from "./routers/indexRoute";
import authRoute from "./routers/authRoute";
import postsRoute from "./routers/postRouters";
import subsRouters from "./routers/subsRouters";

app.use("/auth", authRoute);
app.use("/posts", postsRoute);
app.use("/subs", subsRouters);
app.use("/", indexRoute);

// SERVER
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
