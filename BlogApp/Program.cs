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
var host = builder.Configuration["DB_HOST"];
var port = builder.Configuration["DB_PORT"];
var database = builder.Configuration["DB_NAME"];
var username = builder.Configuration["DB_USER"];
var password = builder.Configuration["DB_PASSWORD"];

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
    // GLOBAL PASSWORD RULES
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true; // special char
});

// ------------------------------------------------------------
// EMAILJS EMAIL SENDER 
// ------------------------------------------------------------

// Register HttpClient + Email sender
builder.Services.AddTransient<IEmailSender, EmailSender>();


// ------------------------------------------------------------
// MVC
// ------------------------------------------------------------
builder.Services.AddControllersWithViews();

var app = builder.Build();

// ------------------------------------------------------------
// MIGRATIONS + SEED ADMIN + SEED ROLES
// ------------------------------------------------------------
var adminEmail = builder.Configuration["ADMIN_EMAIL"] ?? "admin@example.com";
var adminPassword = builder.Configuration["ADMIN_PASSWORD"] ?? "ChangeThis123!";

using (var scope = app.Services.CreateScope())
{
    var services    = scope.ServiceProvider;
    var context     = services.GetRequiredService<ApplicationDbContext>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

    await context.Database.MigrateAsync();

    // Ensure roles
    if (!await roleManager.RoleExistsAsync("Admin"))
        await roleManager.CreateAsync(new IdentityRole("Admin"));
    if (!await roleManager.RoleExistsAsync("Contributor"))
        await roleManager.CreateAsync(new IdentityRole("Contributor"));

    // Seed main admin
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

// ROUTING
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
