/* ============================================================
   File:    Models/ErrorViewModel.cs
   Purpose: View model for the shared error page, carrying the
            request ID for diagnostics in development mode.

   Sections:
   1) NAMESPACE
   2) ERROR VIEW MODEL
============================================================ */

/* ============================================================
   1) NAMESPACE
   ============================================================ */
namespace BlogApp.Models;

/* ============================================================
   2) ERROR VIEW MODEL
   ============================================================ */
public class ErrorViewModel
{
    /// <summary>
    /// The HTTP request ID (or Activity ID). Null in production
    /// where request tracing is not exposed to end users.
    /// </summary>
    public string? RequestId { get; set; }

    /// <summary>True when RequestId is populated and should be displayed.</summary>
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
