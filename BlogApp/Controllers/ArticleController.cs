/* ============================================================
   File:    Controllers/ArticleController.cs
   Purpose: Manages full CRUD lifecycle for blog articles,
            including image uploads and author-name resolution.

   Responsibilities:
   - Allow Contributors and Admins to create new articles
   - Allow owners (or Admins) to edit articles and upload cover images
   - Allow owners (or Admins) to delete articles
   - List published articles with resolved author display names
   - Render the detail view for a single article

   Sections:
   1) USING DIRECTIVES + NAMESPACE
   2) CONSTRUCTOR + DEPENDENCY INJECTION
   3) ARTICLE LIST (Index)
   4) ARTICLE DETAILS
   5) CREATE ARTICLE (GET + POST)
   6) EDIT ARTICLE (GET + POST) + COVER IMAGE UPLOAD
   7) DELETE ARTICLE
   8) PRIVATE HELPERS
============================================================ */

/* ============================================================
   1) USING DIRECTIVES + NAMESPACE
   ============================================================ */
using BlogApp.Data;
using BlogApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlogApp.Controllers;

/* ============================================================
   2) CONSTRUCTOR + DEPENDENCY INJECTION
   ============================================================ */
public class ArticleController : Controller
{
    private readonly ApplicationDbContext         _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IWebHostEnvironment          _env;

    public ArticleController(
        ApplicationDbContext         context,
        UserManager<ApplicationUser> userManager,
        IWebHostEnvironment          env)
    {
        _context     = context;
        _userManager = userManager;
        _env         = env;
    }

    /* ============================================================
       3) ARTICLE LIST (Index)
       Returns all published articles with author display names resolved.
       ============================================================ */

    public async Task<IActionResult> Index()
    {
        var articles = await _context.Articles
            .Where(a => a.DatePosted <= DateTime.UtcNow)
            .ToListAsync();

        var user = await _userManager.GetUserAsync(User);

        // Replace stored username with full display name for each article
        foreach (var article in articles)
        {
            var author = await _userManager.FindByNameAsync(article.ContributorUsername);
            article.ContributorUsername = author != null
                ? $"{author.FirstName} {author.LastName}"
                : "Unknown Author";
        }

        return View(Tuple.Create(user, articles));
    }

    /* ============================================================
       4) ARTICLE DETAILS
       ============================================================ */

    public async Task<IActionResult> Details(int id)
    {
        var article = await _context.Articles.FirstOrDefaultAsync(m => m.ArticleId == id);
        if (article == null) return NotFound();

        return View(article);
    }

    /* ============================================================
       5) CREATE ARTICLE (GET + POST)
       Restricted to Contributors and Admins.
       Pre-populates ContributorUsername from the logged-in user.
       ============================================================ */

    [Authorize(Roles = "Contributor,Admin")]
    public async Task<IActionResult> Create()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var article = new Article
        {
            ContributorUsername = user.UserName ?? "Unknown User"
        };

        return View(article);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Contributor,Admin")]
    public async Task<IActionResult> Create(Article article)
    {
        // ContributorUsername is set server-side; remove it from validation
        ModelState.Remove(nameof(article.ContributorUsername));

        if (!ModelState.IsValid)
            return View(article);

        var user = await _userManager.GetUserAsync(User);
        if (user == null || string.IsNullOrEmpty(user.UserName))
        {
            ModelState.AddModelError("", "User information is not available. Please log in again.");
            return View(article);
        }

        article.ContributorUsername = user.UserName;
        article.DatePosted          = DateTime.UtcNow;

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        return RedirectToAction("Index", "Home");
    }

    /* ============================================================
       6) EDIT ARTICLE (GET + POST) + COVER IMAGE UPLOAD
       Contributors may only edit their own articles; Admins can edit any.
       An optional file upload replaces the cover image URL.
       ============================================================ */

    [Authorize(Roles = "Contributor,Admin")]
    public async Task<IActionResult> Edit(int? id)
    {
        if (id == null) return NotFound();

        var article = await _context.Articles.FindAsync(id);
        if (article == null) return NotFound();

        // Enforce ownership: contributors can only edit their own articles
        if (!User.IsInRole("Admin") && article.ContributorUsername != User.Identity?.Name)
            return Forbid();

        return View(article);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, Article updatedArticle, IFormFile? ImageFile)
    {
        if (id != updatedArticle.ArticleId) return NotFound();

        var article = await _context.Articles.FindAsync(id);
        if (article == null) return NotFound();

        // Apply field updates
        article.Title            = updatedArticle.Title;
        article.ShortDescription = updatedArticle.ShortDescription;
        article.ContentHtml      = updatedArticle.ContentHtml;
        article.CoverImageUrl    = updatedArticle.CoverImageUrl;

        // If a file was uploaded, save it and override the URL
        if (ImageFile != null)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + ImageFile.FileName;
            var filePath       = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await ImageFile.CopyToAsync(fileStream);
            }

            article.CoverImageUrl = "/uploads/" + uniqueFileName;
        }

        await _context.SaveChangesAsync();

        return RedirectToAction("Index", "Home");
    }

    /* ============================================================
       7) DELETE ARTICLE
       Contributors may only delete their own articles; Admins can delete any.
       ============================================================ */

    [HttpPost, ActionName("DeleteConfirmed")]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Contributor,Admin")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null) return NotFound();

        if (!User.IsInRole("Admin") && article.ContributorUsername != User.Identity?.Name)
            return Forbid();

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();

        return RedirectToAction("Index", "Home");
    }

    /* ============================================================
       8) PRIVATE HELPERS
       ============================================================ */

    private bool ArticleExists(int id) =>
        _context.Articles.Any(e => e.ArticleId == id);

    private IActionResult ErrorView(string message)
    {
        ViewBag.ErrorMessage = message;
        return View("~/Views/Shared/Error.cshtml");
    }
}
