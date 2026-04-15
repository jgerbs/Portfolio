/* ============================================================
   File:    Controllers/AccountController.cs
   Purpose: Handles all user account actions — registration,
            login, email confirmation, password reset, and
            admin-level user management.

   Responsibilities:
   - Register new users and send HTML email confirmation links
   - Resend confirmation emails on user request
   - Confirm email addresses via tokenized URL
   - Authenticate users with lockout and confirmation checks
   - Support forgot-password / reset-password flows via email
   - Allow admins to suspend, unsuspend, delete, promote, and demote users

   Sections:
   1) USING DIRECTIVES + NAMESPACE
   2) CONSTRUCTOR + DEPENDENCY INJECTION
   3) REGISTRATION + EMAIL CONFIRMATION DISPATCH
   4) RESEND CONFIRMATION EMAIL
   5) CONFIRM EMAIL (token validation)
   6) LOGIN + LOGOUT
   7) FORGOT PASSWORD + RESET PASSWORD
   8) ADMIN — USER MANAGEMENT (list, suspend, delete)
   9) ADMIN — ROLE MANAGEMENT (make/remove admin)
   10) PRIVATE HELPER
============================================================ */

/* ============================================================
   1) USING DIRECTIVES + NAMESPACE
   ============================================================ */
using BlogApp.Models;
using BlogApp.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlogApp.Controllers
{
    /* ============================================================
       2) CONSTRUCTOR + DEPENDENCY INJECTION
       ============================================================ */
    public class AccountController : Controller
    {
        private readonly UserManager<ApplicationUser>   _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole>      _roleManager;
        private readonly IEmailSender                   _emailSender;
        private readonly IConfiguration                 _config;

        public AccountController(
            UserManager<ApplicationUser>   userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole>      roleManager,
            IEmailSender                   emailSender,
            IConfiguration                 config)
        {
            _userManager   = userManager;
            _signInManager = signInManager;
            _roleManager   = roleManager;
            _emailSender   = emailSender;
            _config        = config;
        }

        /* ============================================================
           3) REGISTRATION + EMAIL CONFIRMATION DISPATCH
           ============================================================ */

        [HttpGet]
        public IActionResult Register() => View(new RegisterViewModel());

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = new ApplicationUser
            {
                UserName   = model.Email,
                Email      = model.Email,
                FirstName  = model.FirstName,
                LastName   = model.LastName,
                IsApproved = true
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                bool isDuplicate = result.Errors.Any(e =>
                    e.Code == "DuplicateUserName" || e.Code == "DuplicateEmail");

                if (isDuplicate)
                    ViewBag.DuplicateEmail = true;

                foreach (var error in result.Errors)
                    ModelState.AddModelError("", error.Description);

                return View(model);
            }

            await _userManager.AddToRoleAsync(user, "Contributor");

            await SendConfirmationEmailAsync(user);

            TempData["RegisterSuccess"] = user.Email;
            return RedirectToAction("Register");
        }

        /* ============================================================
           4) RESEND CONFIRMATION EMAIL
           ============================================================ */

        [HttpPost]
        public async Task<IActionResult> ResendConfirmationEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return RedirectToAction("CheckEmail", new { email = "", error = "Invalid email." });

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
                return RedirectToAction("CheckEmail", new { email, error = "No account found with that email." });

            if (user.EmailConfirmed)
                return RedirectToAction("Login");

            if (user.Email == null)
                return ErrorView("Email address is missing. Please try again.");

            await SendConfirmationEmailAsync(user);

            return RedirectToAction("CheckEmail", new { email, resent = true });
        }

        public IActionResult CheckEmail(string email, bool? resent, string error)
        {
            ViewBag.Email  = email;
            ViewBag.Error  = error;
            ViewBag.Resent = resent ?? false;
            return View();
        }

        /* ============================================================
           5) CONFIRM EMAIL (token validation)
           ============================================================ */

        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (userId == null || token == null)
                return BadRequest("Invalid confirmation link.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            var result = await _userManager.ConfirmEmailAsync(user, token);

            if (result.Succeeded)
            {
                user.IsApproved = true;
                await _userManager.UpdateAsync(user);
                return View("ConfirmSuccess");
            }

            return View("ConfirmFailed");
        }

        /* ============================================================
           6) LOGIN + LOGOUT
           ============================================================ */

        [HttpGet]
        public IActionResult Login() => View(new LoginViewModel());

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = await _userManager.FindByNameAsync(model.Email);

            if (user == null)
            {
                ModelState.AddModelError("", "No account found with that email.");
                return View(model);
            }

            if (!user.EmailConfirmed)
            {
                ModelState.AddModelError("", "Please confirm your email before signing in.");
                return View(model);
            }

            // Block suspended users (LockoutEnd set far in the future)
            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow)
            {
                ModelState.AddModelError("", "Your account has been suspended. Contact the administrator.");
                return View(model);
            }

            if (string.IsNullOrEmpty(user.UserName))
                return ErrorView("User account information is missing.");

            var result = await _signInManager.PasswordSignInAsync(
                user.UserName, model.Password, model.RememberMe, lockoutOnFailure: false);

            if (result.Succeeded)
                return RedirectToAction("Index", "Home");

            ModelState.AddModelError("", "Invalid password.");
            return View(model);
        }

        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }

        /* ============================================================
           7) FORGOT PASSWORD + RESET PASSWORD
           ============================================================ */

        [HttpGet]
        public IActionResult ForgotPassword() => View();

        [HttpPost]
        public async Task<IActionResult> ForgotPassword(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                TempData["Error"] = "Please enter your email.";
                return View();
            }

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                TempData["Error"] = "No account found with that email.";
                return View();
            }

            if (!user.EmailConfirmed)
            {
                TempData["Error"] = "You must confirm your email before resetting your password.";
                return View();
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(user.Email))
                return ErrorView("Password reset token or email is missing. Please try again.");

            var baseUrl   = _config["APP_BASE_URL"] ?? $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}";
            var resetLink = $"{baseUrl}/Account/ResetPassword" +
                            $"?email={Uri.EscapeDataString(user.Email)}" +
                            $"&token={Uri.EscapeDataString(token)}";

            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "email", "resetpassword.html");
            var html = await System.IO.File.ReadAllTextAsync(path);
            html = html.Replace("{{reset_link}}", resetLink);

            await _emailSender.SendEmailAsync(user.Email, "Reset your password", html);

            TempData["ResetSuccess"] = "Password reset instructions have been sent to your email.";
            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult ResetPassword(string email, string token)
        {
            if (email == null || token == null)
                return BadRequest("Invalid password reset link.");

            ViewBag.Email = email;
            ViewBag.Token = token;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> ResetPassword(string email, string token, string password)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
            {
                TempData["Error"] = "Invalid password reset request.";
                return RedirectToAction("Login");
            }

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                TempData["Error"] = "No user found.";
                return RedirectToAction("Login");
            }

            var result = await _userManager.ResetPasswordAsync(user, token, password);

            if (result.Succeeded)
            {
                TempData["Success"] = "Your password has been reset! You may now log in.";
                return RedirectToAction("Login");
            }

            foreach (var error in result.Errors)
                ModelState.AddModelError("", error.Description);

            ViewBag.Email = email;
            ViewBag.Token = token;
            return View();
        }

        /* ============================================================
           8) ADMIN — USER MANAGEMENT (list, suspend, unsuspend, delete)
           ============================================================ */

        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ManageUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            return View(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> SuspendUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            // Set LockoutEnd 100 years ahead to effectively ban the user
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
            await _userManager.UpdateAsync(user);

            TempData["Success"] = "User suspended.";
            return RedirectToAction("ManageUsers");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> UnsuspendUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            user.LockoutEnd = null;
            await _userManager.UpdateAsync(user);

            TempData["Success"] = "User unsuspended.";
            return RedirectToAction("ManageUsers");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                TempData["Success"] = "User not found.";
                return RedirectToAction("ManageUsers");
            }

            var result = await _userManager.DeleteAsync(user);

            TempData["Success"] = result.Succeeded
                ? "User deleted successfully."
                : "Could not delete user.";

            return RedirectToAction("ManageUsers");
        }

        /* ============================================================
           9) ADMIN — ROLE MANAGEMENT (promote to admin, demote to contributor)
           ============================================================ */

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> MakeAdmin(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            if (!await _roleManager.RoleExistsAsync("Admin"))
                await _roleManager.CreateAsync(new IdentityRole("Admin"));

            if (await _userManager.IsInRoleAsync(user, "Contributor"))
                await _userManager.RemoveFromRoleAsync(user, "Contributor");

            await _userManager.AddToRoleAsync(user, "Admin");

            TempData["Success"] = $"{user.Email} has been granted Admin privileges.";
            return RedirectToAction("ManageUsers");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> RemoveAdmin(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (string.IsNullOrEmpty(user?.Email))
                return ErrorView("Unable to update role. Email not found.");

            // Prevent demoting the primary admin account
            var primaryAdmin = Environment.GetEnvironmentVariable("ADMIN_EMAIL");
            if (!string.IsNullOrEmpty(primaryAdmin) &&
                user.Email.Equals(primaryAdmin, StringComparison.OrdinalIgnoreCase))
            {
                TempData["Success"] = "The primary admin cannot be demoted.";
                return RedirectToAction("ManageUsers");
            }

            if (await _userManager.IsInRoleAsync(user, "Admin"))
                await _userManager.RemoveFromRoleAsync(user, "Admin");

            if (!await _roleManager.RoleExistsAsync("Contributor"))
                await _roleManager.CreateAsync(new IdentityRole("Contributor"));

            if (!await _userManager.IsInRoleAsync(user, "Contributor"))
                await _userManager.AddToRoleAsync(user, "Contributor");

            TempData["Success"] = $"{user.Email} is no longer an Admin and has been reassigned as a Contributor.";
            return RedirectToAction("ManageUsers");
        }

        /* ============================================================
           10) PRIVATE HELPER
           ============================================================ */

        /// <summary>
        /// Generates and sends an email confirmation link to the given user.
        /// Resolves the base URL from config (APP_BASE_URL) or the current request.
        /// </summary>
        private async Task SendConfirmationEmailAsync(ApplicationUser user)
        {
            var token      = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var baseUrl    = _config["APP_BASE_URL"] ?? $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}";
            var confirmUrl = $"{baseUrl}/Account/ConfirmEmail?userId={user.Id}&token={Uri.EscapeDataString(token)}";

            var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "email", "confirm.html");
            var html         = await System.IO.File.ReadAllTextAsync(templatePath);
            html = html.Replace("{{confirm_link}}", confirmUrl);

            await _emailSender.SendEmailAsync(user.Email!, "Confirm your BlogApp account", html);
        }

        /// <summary>
        /// Renders the shared Error view with a custom message via ViewBag.
        /// </summary>
        private IActionResult ErrorView(string message)
        {
            ViewBag.ErrorMessage = message;
            return View("~/Views/Shared/Error.cshtml");
        }
    }
}
