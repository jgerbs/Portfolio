/* ============================================================
   File:    Models/Article.cs
   Purpose: EF Core entity representing a single blog article
            with its metadata, content, and authorship.

   Responsibilities:
   - Define primary key, title, description, and content fields
   - Track the posting timestamp and the contributor's username
   - Expose an optional cover image URL for header display

   Sections:
   1) USING DIRECTIVES + NAMESPACE
   2) ARTICLE ENTITY
============================================================ */

/* ============================================================
   1) USING DIRECTIVES + NAMESPACE
   ============================================================ */
using System.ComponentModel.DataAnnotations;

namespace BlogApp.Models;

/* ============================================================
   2) ARTICLE ENTITY
   ============================================================ */
public class Article
{
    public int ArticleId { get; set; }

    [Required, StringLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(300)]
    [Display(Name = "Short Description")]
    public string ShortDescription { get; set; } = string.Empty;

    [Display(Name = "Cover Image URL")]
    public string? CoverImageUrl { get; set; }

    [Required]
    [Display(Name = "Article Content")]
    public string ContentHtml { get; set; } = string.Empty;

    /// <summary>Set by the server at creation time; always stored as UTC.</summary>
    public DateTime DatePosted { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Stores the author's Identity username at write time.
    /// Resolved to a full display name at read time in the controller.
    /// </summary>
    [Required]
    public string ContributorUsername { get; set; } = string.Empty;
}
