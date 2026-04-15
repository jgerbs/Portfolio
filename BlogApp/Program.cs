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
   2) DATABASE CONNECTION RESOLUTION
   3) SERVICE REGISTRATION (EF Core + Identity + Email + MVC)
   4) PASSWORD POLICY CONFIGURATION
   5) STARTUP SEED (migrations, roles, admin user)
   6) MIDDLEWARE PIPELINE + ROUTING
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

var builder = WebApplication.CreateBuilder(args);

/* ============================================================
   2) DATABASE CONNECTION RESOLUTION
   Prefer environment variables (Render/production);
   fall back to appsettings.Development.json for local dev.
   ============================================================ */
var host     = Environment.GetEnvironmentVariable("DB_HOST");
var port     = Environment.GetEnvironmentVariable("DB_PORT");
var database = Environment.GetEnvironmentVariable("DB_NAME");
var username = Environment.GetEnvironmentVariable("DB_USER");
var password = Environment.GetEnvironmentVariable("DB_PASSWORD");

if (string.IsNullOrWhiteSpace(host))
{
    host     = builder.Configuration["Database:Host"]     ?? "localhost";
    port     = builder.Configuration["Database:Port"]     ?? "5432";
    database = builder.Configuration["Database:Name"]     ?? "blogappdb";
    username = builder.Configuration["Database:User"]     ?? "postgres";
    password = builder.Configuration["Database:Password"] ?? "P@$$w0rd";
}

var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";

/* ============================================================
   3) SERVICE REGISTRATION (EF Core + Identity + Email + MVC)
   ============================================================ */
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedEmail  = true;
    options.Lockout.AllowedForNewUsers   = false;
    options.Password.RequireNonAlphanumeric = false; // overridden below by IdentityOptions
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddTransient<IEmailSender, EmailSender>();
builder.Services.AddControllersWithViews();

/* ============================================================
   4) PASSWORD POLICY CONFIGURATION
   Applied via IdentityOptions after AddIdentity to ensure
   these settings take precedence over the inline defaults above.
   ============================================================ */
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength          = 8;
    options.Password.RequireDigit            = true;
    options.Password.RequireLowercase        = true;
    options.Password.RequireUppercase        = true;
    options.Password.RequireNonAlphanumeric  = true;
});

var app = builder.Build();

/* ============================================================
   5) STARTUP SEED (migrations, roles, admin user)
   Resolves admin credentials from environment variables with
   appsettings fallback, then ensures roles and admin exist.
   ============================================================ */
var adminEmail    = Environment.GetEnvironmentVariable("ADMIN_EMAIL")
                    ?? builder.Configuration["AppSettings:AdminEmail"]
                    ?? "admin@example.com";

var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD")
                    ?? builder.Configuration["AppSettings:AdminPassword"]
                    ?? "ChangeThis123!";

using (var scope = app.Services.CreateScope())
{
    var services    = scope.ServiceProvider;
    var context     = services.GetRequiredService<ApplicationDbContext>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

    // Apply any pending EF Core migrations
    await context.Database.MigrateAsync();

    // Ensure required roles exist
    if (!await roleManager.RoleExistsAsync("Admin"))
        await roleManager.CreateAsync(new IdentityRole("Admin"));
    if (!await roleManager.RoleExistsAsync("Contributor"))
        await roleManager.CreateAsync(new IdentityRole("Contributor"));

    // Create the default admin user if not already present
    var admin = await userManager.FindByEmailAsync(adminEmail);
    if (admin == null)
    {
        admin = new ApplicationUser
        {
            UserName       = adminEmail,
            Email          = adminEmail,
            FirstName      = "Admin",
            LastName       = "User",
            EmailConfirmed = true,
            IsApproved     = true
        };

        var result = await userManager.CreateAsync(admin, adminPassword);
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "Admin");
    }
}

/* ============================================================
   6) MIDDLEWARE PIPELINE + ROUTING
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
    name:    "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
