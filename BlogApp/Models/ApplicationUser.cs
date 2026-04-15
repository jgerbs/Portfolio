/* ============================================================
   File:    Models/ApplicationUser.cs
   Purpose: Extends ASP.NET Identity's IdentityUser with
            blog-specific profile fields and approval state.

   Responsibilities:
   - Add required FirstName and LastName display fields
   - Track admin-approval status via IsApproved
   - Store the user's default role label (informational)

   Sections:
   1) USING DIRECTIVES + NAMESPACE
   2) APPLICATION USER MODEL
============================================================ */

/* ============================================================
   1) USING DIRECTIVES + NAMESPACE
   ============================================================ */
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace BlogApp.Models;

/* ============================================================
   2) APPLICATION USER MODEL
   ============================================================ */
public class ApplicationUser : IdentityUser
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName  { get; set; } = string.Empty;

    /// <summary>True once the user has confirmed their email address.</summary>
    public bool IsApproved { get; set; } = false;

    /// <summary>Informational role label; actual authorization uses Identity roles.</summary>
    public string Role { get; set; } = "Contributor";
}
