/* ============================================================
   File:    Controllers/HomeController.cs
   Purpose: Serves the blog home page with date-filtered,
            reverse-chronological article listings.

   Responsibilities:
   - Resolve the currently authenticated user (if any)
   - Apply optional startDate / endDate query filters to articles
   - Pass an IsAdmin flag to the view for conditional UI rendering
   - Return a Tuple<ApplicationUser?, List<Article>> model to the view

   Sections:
   1) USING DIRECTIVES + NAMESPACE
   2) CONSTRUCTOR + DEPENDENCY INJECTION
   3) HOME INDEX (date-filtered article list)
   4) PRIVATE HELPER
============================================================ */

/* ============================================================
   1) USING DIRECTIVES + NAMESPACE
   ============================================================ */
using BlogApp.Data;
using BlogApp.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlogApp.Controllers;

/* ============================================================
   2) CONSTRUCTOR + DEPENDENCY INJECTION
   ============================================================ */
public class HomeController : Controller
{
    private readonly ApplicationDbContext         _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public HomeController(
        ApplicationDbContext         context,
        UserManager<ApplicationUser> userManager)
    {
        _context     = context;
        _userManager = userManager;
    }

    /* ============================================================
       3) HOME INDEX (date-filtered article list)
       Accepts optional startDate / endDate query parameters to
       narrow the article set. Results are ordered newest-first.
       ViewBag.IsAdmin drives admin-only UI elements in the view.
       ============================================================ */

    public async Task<IActionResult> Index(DateTime? startDate, DateTime? endDate)
    {
        if (_userManager == null || _context == null)
            return ErrorView("Internal system error: dependencies not loaded properly.");

        // Resolve the current user (null when anonymous)
        ApplicationUser? user = null;
        if (User.Identity != null && User.Identity.IsAuthenticated)
            user = await _userManager.GetUserAsync(User);

        ViewBag.IsAdmin = user != null && await _userManager.IsInRoleAsync(user, "Admin");

        // Build the article query with optional date filters
        var articlesQuery = _context.Articles.AsQueryable();

        if (startDate.HasValue && endDate.HasValue)
            articlesQuery = articlesQuery.Where(a => a.DatePosted >= startDate && a.DatePosted <= endDate);
        else if (startDate.HasValue)
            articlesQuery = articlesQuery.Where(a => a.DatePosted >= startDate);
        else if (endDate.HasValue)
            articlesQuery = articlesQuery.Where(a => a.DatePosted <= endDate);

        var articles = await articlesQuery
            .OrderByDescending(a => a.DatePosted)
            .ToListAsync();

        var model = new Tuple<ApplicationUser?, List<Article>>(user, articles);
        return View(model);
    }

    /* ============================================================
       4) PRIVATE HELPER
       ============================================================ */

    private IActionResult ErrorView(string message)
    {
        ViewBag.ErrorMessage = message;
        return View("~/Views/Shared/Error.cshtml");
    }
}
