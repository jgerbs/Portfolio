/* ============================================================
   File:    Models/ViewModels/RegisterViewModel.cs
   Purpose: View model for the registration form — carries new
            account details with password complexity validation.

   Sections:
   1) USING DIRECTIVES + NAMESPACE
   2) REGISTER VIEW MODEL
============================================================ */

/* ============================================================
   1) USING DIRECTIVES + NAMESPACE
   ============================================================ */
using System.ComponentModel.DataAnnotations;

namespace BlogApp.ViewModels;

/* ============================================================
   2) REGISTER VIEW MODEL
   ============================================================ */
public class RegisterViewModel
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, DataType(DataType.Password)]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$",
        ErrorMessage = "Password must contain an uppercase letter, lowercase letter, number, and special character.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName  { get; set; } = string.Empty;
}
