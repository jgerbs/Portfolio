// Jack Gerber - A01266976
// Date: Feb 16, 2025

using BlogApp.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using BlogApp.Models;
using Microsoft.AspNetCore.Identity.UI.Services;
using BlogApp.Services;
using Npgsql.EntityFrameworkCore.PostgreSQL;

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------------------------------
// DATABASE + IDENTITY
// ------------------------------------------------------------

// Try to read environment variables (Render)
var host = Environment.GetEnvironmentVariable("DB_HOST");
var port = Environment.GetEnvironmentVariable("DB_PORT");
var database = Environment.GetEnvironmentVariable("DB_NAME");
var username = Environment.GetEnvironmentVariable("DB_USER");
var password = Environment.GetEnvironmentVariable("DB_PASSWORD");

// If null, fall back to local appsettings.Development.json
if (string.IsNullOrWhiteSpace(host))
{
    host = builder.Configuration["Database:Host"] ?? "localhost";
    port = builder.Configuration["Database:Port"] ?? "5432";
    database = builder.Configuration["Database:Name"] ?? "blogappdb";
    username = builder.Configuration["Database:User"] ?? "postgres";
    password = builder.Configuration["Database:Password"] ?? "Kilimanjar0!";
}

// Build connection string dynamically
var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedEmail = true;
    options.Lockout.AllowedForNewUsers = false;
    options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ------------------------------------------------------------
// CONFIGURE PASSWORD DEFAULTS
// ------------------------------------------------------------
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
});

// ------------------------------------------------------------
// EMAILJS EMAIL SENDER
// ------------------------------------------------------------
builder.Services.AddTransient<IEmailSender, EmailSender>();

// ------------------------------------------------------------
// MVC
// ------------------------------------------------------------
builder.Services.AddControllersWithViews();

var app = builder.Build();

// ------------------------------------------------------------
// MIGRATIONS + SEED ADMIN + SEED ROLES
// ------------------------------------------------------------
var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL")
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

    await context.Database.MigrateAsync();

    if (!await roleManager.RoleExistsAsync("Admin"))
        await roleManager.CreateAsync(new IdentityRole("Admin"));
    if (!await roleManager.RoleExistsAsync("Contributor"))
        await roleManager.CreateAsync(new IdentityRole("Contributor"));

    var admin = await userManager.FindByEmailAsync(adminEmail);
    if (admin == null)
    {
        admin = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "Admin",
            LastName = "User",
            EmailConfirmed = true,
            IsApproved = true
        };

        var created = await userManager.CreateAsync(admin, adminPassword);
        if (created.Succeeded)
            await userManager.AddToRoleAsync(admin, "Admin");
    }
}

// ------------------------------------------------------------
// MIDDLEWARE
// ------------------------------------------------------------
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
