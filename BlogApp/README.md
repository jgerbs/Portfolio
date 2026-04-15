# BlogApp

A full-stack blog platform built with ASP.NET Core 9 MVC, demonstrating production-style authentication, role-based authorization, transactional email, and a complete content management workflow — deployed as a portfolio project on Render.

## Overview

BlogApp is a multi-user blogging application where authenticated contributors can publish articles and admins can manage the user base. The focus is on backend engineering: the project implements the full ASP.NET Identity lifecycle — registration, email confirmation, password reset, account lockout/suspension, and role promotion/demotion — on top of a PostgreSQL database backed by Entity Framework Core.

This is a demonstration environment intended to showcase real-world auth patterns, server-side MVC architecture, and database-driven content management rather than production-scale hosting.

## Features

- User registration with required email confirmation before first login
- HTML transactional emails via Resend (account confirmation, password reset)
- Resend-confirmation flow for users who did not receive the initial email
- Password reset via tokenized email links
- Two roles — `Admin` and `Contributor` — seeded automatically on startup
- Default admin account seeded from environment variables on first run
- Contributors can create, edit, and delete their own articles
- Admins can edit or delete any article and manage all user accounts
- Admin dashboard: suspend / unsuspend / delete users, promote to Admin, demote to Contributor
- Primary admin account cannot be demoted through the UI
- Article cover images accepted as either a URL or a direct file upload
- Home page splits articles into a featured top-3 card layout and an older-articles list
- Date-range filter on the home page to narrow the article feed
- Anti-forgery tokens on all state-mutating POST requests
- EF Core migrations applied automatically on startup

## Tech Stack

**Backend**
- [ASP.NET Core 9 MVC](https://learn.microsoft.com/en-us/aspnet/core/) — C#
- [ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) — authentication & authorization
- [Entity Framework Core 9](https://learn.microsoft.com/en-us/ef/core/) with [Npgsql](https://www.npgsql.org/efcore/) provider

**Database**
- [PostgreSQL](https://www.postgresql.org/)

**Email**
- [Resend](https://resend.com/) — transactional HTML email delivery

**Frontend**
- Razor Views (`.cshtml`) — server-rendered
- [Bootstrap 5](https://getbootstrap.com/) — layout and components
- jQuery (Bootstrap dependency)

**Deployment**
- [Render](https://render.com/) — free-tier web service + managed PostgreSQL

## Architecture

```
Browser
  └── HTTP Request
        └── ASP.NET Core MVC Pipeline
              ├── Authentication middleware (cookie-based Identity)
              ├── Authorization middleware (role checks)
              └── Controllers
                    ├── HomeController    — article feed with date filtering
                    ├── ArticleController — CRUD, image uploads, ownership checks
                    └── AccountController — registration, email flows, admin panel
                          └── EmailSender (IEmailSender → Resend API)
                                └── PostgreSQL via EF Core (ApplicationDbContext)
                                      ├── ASP.NET Identity tables (users, roles, claims…)
                                      └── Articles table
```

The application is a single server-rendered MVC app — there is no separate API or frontend build step. All database migrations and role/admin seeding run automatically at startup via `context.Database.MigrateAsync()`.

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9)
- A running PostgreSQL instance (local or remote)
- A [Resend](https://resend.com/) account with an API key and a verified sender address

## Installation

```bash
git clone https://github.com/jgerbs/Portfolio.git
cd BlogApp
```

## Environment Variables

The app resolves its database connection and email credentials from environment variables at runtime, falling back to `appsettings.json` values for local development.

**Database**

| Variable      | Description           | Dev default |
|---------------|-----------------------|-------------|
| `DB_HOST`     | PostgreSQL host       | `localhost` |
| `DB_PORT`     | PostgreSQL port       | `5432`      |
| `DB_NAME`     | Database name         | `blogappdb` |
| `DB_USER`     | Database user         | `postgres`  |
| `DB_PASSWORD` | Database password     | —           |

**Application**

| Variable         | Description                                                              |
|------------------|--------------------------------------------------------------------------|
| `ADMIN_EMAIL`    | Email address for the seeded admin account                               |
| `ADMIN_PASSWORD` | Password for the seeded admin account                                    |
| `APP_BASE_URL`   | Full origin used in email links (e.g. `https://your-app.onrender.com`)  |

**Email — set in `appsettings.json` or as environment variables**

| Key                | Description                    |
|--------------------|--------------------------------|
| `Resend:ApiKey`    | Resend API key — **required**  |
| `Resend:FromEmail` | Verified sender address        |

For local development, add these to `appsettings.Development.json` (do not commit this file):

```json
{
  "Database": {
    "Host":     "localhost",
    "Port":     "5432",
    "Name":     "blogappdb",
    "User":     "postgres",
    "Password": "your_password"
  },
  "AppSettings": {
    "AdminEmail":    "admin@example.com",
    "AdminPassword": "YourAdminPassword1!"
  },
  "Resend": {
    "ApiKey":    "re_your_api_key",
    "FromEmail": "noreply@yourdomain.com"
  }
}
```

## Running Locally

```bash
dotnet run
```

The app starts at `http://localhost:5171`. On first run it applies any pending EF Core migrations and seeds the `Admin` and `Contributor` roles along with the default admin user defined in your configuration.

To use HTTPS locally:

```bash
dotnet run --launch-profile https
```

## Usage

**Anonymous visitors** can browse published articles and read individual posts.

**Registered contributors** (email confirmation required before login) can:
- Create new articles with a title, short description, HTML content, and an optional cover image
- Edit and delete their own articles

**Admins** can:
- Edit or delete any article
- Access the Manage Accounts dashboard from the navbar
- Suspend, unsuspend, delete, promote, or demote any non-primary-admin user

The seeded admin account is created automatically from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first startup. Log in with those credentials to access admin features immediately.

## Live Demo

> The live demo may take **15–30 seconds** to respond on first load — the Render free tier spins the server down after inactivity. Subsequent requests are fast once the instance is warm.

This deployment connects to a Render-managed PostgreSQL instance. Email confirmation is fully active: registration requires a real, accessible email address to receive the confirmation link before login is permitted.

## Known Issues / Limitations

- Article content is stored and rendered as raw HTML. There is no rich-text editor — contributors write or paste HTML directly into the content field.
- Uploaded cover images are saved to `wwwroot/uploads/` on the server's local filesystem. On Render's free tier the filesystem is ephemeral, so uploaded images will not persist across redeployments. Using a cover image URL instead of a file upload avoids this.
- No pagination — all articles are loaded in a single query on the home page.
- SendGrid is listed as a dependency in the `.csproj` but is not currently wired up; only Resend is active.

## Roadmap

- Replace the raw HTML content field with a rich-text editor (e.g. Quill or TipTap)
- Move image uploads to object storage (e.g. Cloudflare R2 or AWS S3) to survive redeployments
- Add pagination to the article feed
- Add per-article comments
- Add article search by title or author name

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
