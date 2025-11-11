// Jack Gerber - A01266976
// Date: Feb 16, 2025

using System.ComponentModel.DataAnnotations;

namespace BlogApp.ViewModels;

public class RegisterViewModel
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, DataType(DataType.Password)]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$",
        ErrorMessage = "Password must contain an uppercase letter, lowercase letter, number, and special character.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;
}

