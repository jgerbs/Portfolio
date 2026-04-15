# Reddit Clone

A server-rendered Reddit-style web application built with Node.js, Express, TypeScript, and PostgreSQL — demonstrating full-stack MVC architecture, session-based authentication, relational data modeling, and CRUD across multiple interconnected resources.

## Overview

This app replicates the core mechanics of Reddit: users can log in, submit posts to subgroups, comment on posts, and vote them up or down. The vote total on each post is tracked in the database and displayed everywhere the post appears. Subgroups are created implicitly — typing a new subgroup name during post creation adds it to the system.

The project is a portfolio piece demonstrating how a multi-resource web application fits together: authentication middleware, ownership-guarded routes, cascading deletes, and a shared EJS layout. It is not a production deployment.

## Features

- Session-based login and logout via Passport.js local strategy
- Post feed showing the 20 most recent posts, ordered newest-first
- Create posts with a title, optional link, optional description, and a required subgroup
- Server-side form validation — a post must have at least a link or a description
- View individual posts with their full comment thread and net vote total
- Edit and delete your own posts (ownership enforced server-side)
- Delete confirmation page before a post is removed
- Cascading delete — removing a post also removes its associated comments and votes
- Add comments to any post while logged in
- Delete your own comments (ownership enforced)
- Upvote or downvote posts (+1 / -1); voting the same direction again removes the vote
- Vote state persisted per user/post pair using a database upsert
- Subgroup list page showing all subgroups that have at least one post, sorted alphabetically
- Subgroup view filtered to only show posts belonging to that subgroup
- Shared header layout with context-aware nav (login link vs. create post link based on auth state)
- Database seed script for local development

## Tech Stack

**Backend**
- [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) — HTTP server and routing
- [TypeScript](https://www.typescriptlang.org/) — typed throughout, run directly via `tsx`
- [Passport.js](https://www.passportjs.org/) (`passport-local`) — session-based authentication

**Templating**
- [EJS](https://ejs.co/) with [express-ejs-layouts](https://www.npmjs.com/package/express-ejs-layouts) — server-rendered views with a shared layout

**Database**
- [PostgreSQL](https://www.postgresql.org/) — relational database
- [Prisma ORM](https://www.prisma.io/) — schema definition, migrations, and query client

**Session**
- [express-session](https://www.npmjs.com/package/express-session) — server-side session storage

**Tooling**
- [tsx](https://github.com/privatenumber/tsx) — runs TypeScript directly without a separate compile step
- `nodemon` — file watching in development

## Architecture

```
Browser
  └── HTTP Request (form POST or GET)
        └── Express Router
              ├── /auth     — login, logout (Passport.js local strategy)
              ├── /posts    — post CRUD, comments, votes
              ├── /subs     — subgroup list and filtered view
              └── /         — redirects to /posts
                    └── Controller layer (postController.ts / userController.ts)
                          └── db.ts (Prisma query functions)
                                └── PostgreSQL
```

All responses are server-rendered EJS templates — there is no client-side JavaScript framework. Vote submissions and comment submissions trigger a full-page redirect. The authenticated user is injected into `res.locals` on every request so views can conditionally render login/logout links and edit controls.

## Usage

**Browsing**
The home page (`/posts`) shows the 20 most recent posts across all subgroups. Any visitor can read posts and comments without logging in. Navigate to `/subs/list` to see all subgroups and click into any one to see its posts.

**Logging in**
Use the login page at `/auth/login`. If you ran the seed script, log in with username `jack` and password `alpha`. There is no self-service registration — new accounts must be created manually or via the seed script.

**Creating a post**
Once logged in, use the **Create Post** link in the header. A title and subgroup are required; you must provide at least one of a link or a description. Submitting a post with an unrecognized subgroup name creates that subgroup automatically.

**Voting**
Upvote (+1) or downvote (-1) any post using the buttons visible when logged in. Clicking your current vote again removes it. The net total updates on the next page load.

**Editing and deleting**
Edit and delete controls appear on posts you created. Deleting a post shows a confirmation page first and removes all associated comments and votes.

**Commenting**
A comment form appears at the bottom of each post page when logged in. You can delete your own comments from the post view.

## Known Issues / Limitations

- **Passwords are stored in plaintext.** The `userController.ts` file contains a direct string comparison with no hashing. This is an acknowledged limitation of the demo — do not use real passwords.
- **No user registration.** There is no `/signup` route. New users can only be added via the seed script or direct database access.
- **No AJAX — full page reload on every action.** Voting, commenting, and all form submissions trigger a redirect cycle.
- **Session secret is hardcoded** as `"secret"` in `app.ts`. In any real deployment this must be moved to an environment variable.
- **No pagination.** The home feed fetches the 20 most recent posts; subgroup views fetch up to 50. Large datasets are not handled.
- **No comment editing.** Comments can be added and deleted by their author but not modified.
- **No post ordering options.** Posts are always ordered newest-first; there is no vote-count sort.

## Future Improvements

- Hash passwords with bcrypt before storing them
- Add a self-service registration page
- Move the session secret to an environment variable
- Add AJAX voting to avoid full-page reloads
- Add comment editing
- Add an alternative post sort order by vote total
- Add pagination to the post feed

## License

MIT — see `package.json`.

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
