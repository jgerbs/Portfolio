// Jack Gerber - A01266976
// Date: Feb 16, 2025
 
using System.ComponentModel.DataAnnotations;

namespace BlogApp.ViewModels;

public class LoginViewModel
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; }
}

