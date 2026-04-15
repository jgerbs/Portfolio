/* ============================================================
   File:    Models/ViewModels/LoginViewModel.cs
   Purpose: View model for the login form — carries credentials
            and the remember-me preference for sign-in.

   Sections:
   1) USING DIRECTIVES + NAMESPACE
   2) LOGIN VIEW MODEL
============================================================ */

/* ============================================================
   1) USING DIRECTIVES + NAMESPACE
   ============================================================ */
using System.ComponentModel.DataAnnotations;

namespace BlogApp.ViewModels;

/* ============================================================
   2) LOGIN VIEW MODEL
   ============================================================ */
public class LoginViewModel
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; }
}
