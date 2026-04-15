/* ============================================================
   File:    Data/ApplicationDbContext.cs
   Purpose: EF Core database context — extends IdentityDbContext
            to combine ASP.NET Identity tables with blog data.

   Responsibilities:
   - Inherit Identity schema (users, roles, claims, tokens, etc.)
   - Expose the Articles DbSet for EF Core queries
   - Provide the OnModelCreating hook for future Fluent API config

   Sections:
   1) USING DIRECTIVES + NAMESPACE
   2) DBCONTEXT CLASS + CONSTRUCTOR
   3) DBSETS
   4) MODEL CONFIGURATION HOOK
============================================================ */

/* ============================================================
   1) USING DIRECTIVES + NAMESPACE
   ============================================================ */
using BlogApp.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BlogApp.Data;

/* ============================================================
   2) DBCONTEXT CLASS + CONSTRUCTOR
   Extends IdentityDbContext so Identity tables are managed
   alongside application data in the same PostgreSQL database.
   ============================================================ */
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    /* ============================================================
       3) DBSETS
       ============================================================ */

    public DbSet<Article> Articles { get; set; }

    /* ============================================================
       4) MODEL CONFIGURATION HOOK
       Calls base to apply Identity schema; extend here with
       Fluent API configuration as the schema grows.
       ============================================================ */
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
