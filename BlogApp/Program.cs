/* ============================================================
   File:    Program.cs
   Purpose: Application entry point — configures services,
            seeds the database, and builds the HTTP pipeline.

   Responsibilities:
   - Reads database connection from environment variables or appsettings fallback
   - Registers EF Core (PostgreSQL), ASP.NET Identity, email sender, and MVC
   - Enforces password policy and email-confirmation-required sign-in
   - Runs migrations and seeds the Admin + Contributor roles on startup
   - Seeds the default admin user if one does not already exist
   - Wires up the standard middleware pipeline and default MVC route

   Sections:
   1) USING DIRECTIVES
   2) APPLICATION SETUP
   3) DATABASE CONNECTION RESOLUTION
   4) SERVICE REGISTRATION
   5) PASSWORD / IDENTITY POLICY
   6) STARTUP MIGRATION + SAFE SEEDING
   7) MIDDLEWARE PIPELINE + ROUTING
============================================================ */

/* ============================================================
   1) USING DIRECTIVES
   ============================================================ */
using BlogApp.Data;
using BlogApp.Models;
using BlogApp.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;

/* ============================================================
   2) APPLICATION SETUP
   ============================================================ */
var builder = WebApplication.CreateBuilder(args);
var environment = builder.Environment;

/* ============================================================
   3) DATABASE CONNECTION RESOLUTION
   Production:
   - Prefer a full connection string from configuration / env
   Development:
   - Allow local appsettings or user-secrets
   No hardcoded secrets anywhere.
   ============================================================ */

// Preferred: one full connection string from ConnectionStrings:DefaultConnection
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

// Optional fallback: build from individual database settings if needed
if (string.IsNullOrWhiteSpace(connectionString))
{
    var host = builder.Configuration["Database:Host"];
    var port = builder.Configuration["Database:Port"];
    var database = builder.Configuration["Database:Name"];
    var username = builder.Configuration["Database:User"];
    var password = builder.Configuration["Database:Password"];

    var hasAllDatabaseParts =
        !string.IsNullOrWhiteSpace(host) &&
        !string.IsNullOrWhiteSpace(port) &&
        !string.IsNullOrWhiteSpace(database) &&
        !string.IsNullOrWhiteSpace(username) &&
        !string.IsNullOrWhiteSpace(password);

    if (hasAllDatabaseParts)
    {
        connectionString =
            $"Host={host};Port={port};Database={database};Username={username};Password={password};" +
            "SSL Mode=Require;Trust Server Certificate=true";
    }
}

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database configuration is missing. Set ConnectionStrings:DefaultConnection " +
        "or provide Database:Host, Database:Port, Database:Name, Database:User, and Database:Password.");
}

/* ============================================================
   4) SERVICE REGISTRATION
   ============================================================ */
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.SignIn.RequireConfirmedEmail = true;
        options.Lockout.AllowedForNewUsers = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddTransient<IEmailSender, EmailSender>();
builder.Services.AddControllersWithViews();

/* ============================================================
   5) PASSWORD / IDENTITY POLICY
   ============================================================ */
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;

    // Optional tightening:
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.User.RequireUniqueEmail = true;
});

var app = builder.Build();

/* ============================================================
   6) STARTUP MIGRATION + SAFE SEEDING
   Safe rules:
   - Migrations run automatically
   - Roles are safe to seed
   - Admin user is created ONLY when explicitly configured
   - No fallback admin email/password
   - Production does not silently invent credentials
   ============================================================ */
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    var context = services.GetRequiredService<ApplicationDbContext>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

    await context.Database.MigrateAsync();

    // Safe role seeding
    string[] roles = { "Admin", "Contributor" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            var roleResult = await roleManager.CreateAsync(new IdentityRole(role));

            if (!roleResult.Succeeded)
            {
                var errors = string.Join("; ", roleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create role '{role}': {errors}");
            }
        }
    }

    // Admin seeding is opt-in only
    var seedAdminEnabled = builder.Configuration.GetValue<bool>("SeedAdmin:Enabled");
    var adminEmail = builder.Configuration["SeedAdmin:Email"];
    var adminPassword = builder.Configuration["SeedAdmin:Password"];
    var adminFirstName = builder.Configuration["SeedAdmin:FirstName"] ?? "Admin";
    var adminLastName = builder.Configuration["SeedAdmin:LastName"] ?? "User";

    if (seedAdminEnabled)
    {
        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            throw new InvalidOperationException(
                "SeedAdmin is enabled, but SeedAdmin:Email or SeedAdmin:Password is missing.");
        }

        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);

        if (existingAdmin == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = adminFirstName,
                LastName = adminLastName,
                EmailConfirmed = true,
                IsApproved = true
            };

            var createResult = await userManager.CreateAsync(adminUser, adminPassword);

            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create seeded admin user: {errors}");
            }

            var roleResult = await userManager.AddToRoleAsync(adminUser, "Admin");

            if (!roleResult.Succeeded)
            {
                var errors = string.Join("; ", roleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to assign Admin role: {errors}");
            }

            logger.LogInformation("Seeded admin user for configured email.");
        }
        else if (!await userManager.IsInRoleAsync(existingAdmin, "Admin"))
        {
            var addToRoleResult = await userManager.AddToRoleAsync(existingAdmin, "Admin");

            if (!addToRoleResult.Succeeded)
            {
                var errors = string.Join("; ", addToRoleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to assign Admin role to existing user: {errors}");
            }

            logger.LogInformation("Existing configured admin user was added to Admin role.");
        }
    }
    else
    {
        logger.LogInformation("Admin seeding is disabled.");
    }
}

/* ============================================================
   7) MIDDLEWARE PIPELINE + ROUTING
   ============================================================ */
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();