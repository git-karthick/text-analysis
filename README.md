### Enabling Sessions in .NET 8 API

ASP.NET Core APIs are stateless by design, but you can enable session state using middleware. This allows you to track per-user sessions and run code when a new session starts. Add the `Microsoft.AspNetCore.Session` package if it's not already included (it's often implicit in the framework).

In your `Program.cs` (or `Startup.cs` if using the older style), configure services and middleware like this:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add session services
builder.Services.AddDistributedMemoryCache(); // Or use a distributed cache like Redis for production
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Adjust as needed
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Add authentication (Windows for now, extensible for SSO)
builder.Services.AddAuthentication("Windows") // For Windows Authentication
    .AddNegotiate(); // Enables Windows Auth

// For future SSO (e.g., OpenID Connect), you can add here later:
// builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
//     .AddOpenIdConnect(options => { /* SSO config */ });

var app = builder.Build();

// Middleware pipeline
app.UseAuthentication();
app.UseAuthorization();
app.UseSession(); // Must come after UseRouting() and before your endpoints

app.MapControllers(); // Or your endpoint setup

app.Run();
```

### Custom Middleware for Procedure Call on Session Start

To call a procedure when a session starts, create custom middleware. This runs per request, checks if the session is new (e.g., via a flag), and executes your logic. It retrieves the user login ID from `HttpContext.User.Identity.Name` (works for Windows Auth). For future SSO, you can adapt it to pull from claims (e.g., `HttpContext.User.FindFirst("sub")?.Value`).

Create a class like `SessionStartMiddleware`:

```csharp
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

public class SessionStartMiddleware
{
    private readonly RequestDelegate _next;

    public SessionStartMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check if this is a new session (e.g., no existing flag)
        const string sessionFlagKey = "SessionStarted";
        if (string.IsNullOrEmpty(context.Session.GetString(sessionFlagKey)))
        {
            // Get user login ID (works for Windows Auth)
            string userId = context.User.Identity?.Name;

            // For future SSO, you could fallback or adapt:
            // string userId = context.User.FindFirst("preferred_username")?.Value ?? context.User.Identity?.Name;

            if (!string.IsNullOrEmpty(userId))
            {
                // Call your procedure here (replace with your actual method)
                await CallYourProcedureAsync(userId);
            }

            // Mark session as started to prevent re-running
            context.Session.SetString(sessionFlagKey, "true");
        }

        // Continue to next middleware
        await _next(context);
    }

    private async Task CallYourProcedureAsync(string userId)
    {
        // Your procedure logic here, e.g., database call or service invocation
        // Example: await _yourService.LogUserSessionStart(userId);
        await Task.CompletedTask; // Placeholder
    }
}
```

Register this middleware in `Program.cs` after `UseSession()`:

```csharp
app.UseMiddleware<SessionStartMiddleware>();
```

### Usage in Controllers

Once set up, sessions are accessible in your API controllers via `HttpContext.Session`. For example:

```csharp
[ApiController]
[Route("api/[controller]")]
public class YourController : ControllerBase
{
    [HttpGet("test")]
    public IActionResult TestSession()
    {
        HttpContext.Session.SetString("TestKey", "Value");
        return Ok(HttpContext.Session.GetString("TestKey"));
    }
}
```

### Key Notes
- **Authentication Flexibility**: The code uses `context.User.Identity.Name` for Windows Auth. When switching to SSO, update the middleware to extract the ID from claims. Ensure SSO config (e.g., via `AddOpenIdConnect`) populates the user principal similarly.
- **Session Caveats**: APIs with sessions can introduce statefulness, which may affect scalability. Consider alternatives like JWT tokens for purely stateless auth if possible.
- **Testing**: For Windows Auth, run in an environment with IIS or enable it in launch settings. For SSO, add the auth scheme when ready.
- **Security**: Ensure cookies are secure (`options.Cookie.SecurePolicy = CookieSecurePolicy.Always` for HTTPS). Avoid storing sensitive data in sessions.

This setup should work for your current Windows setup and adapt to SSO with minimal changes[1][2].

Sources
[1] Session and state management in ASP.NET Core - Microsoft Learn https://learn.microsoft.com/en-us/aspnet/core/fundamentals/app-state?view=aspnetcore-9.0
[2] How to Create and Access Session .net core api? - Stack Overflow https://stackoverflow.com/questions/54868207/how-to-create-and-access-session-net-core-api
[3] ASP.NET Core 8.0 Web API not allowing me to get session objects ... https://stackoverflow.com/questions/79749487/asp-net-core-8-0-web-api-not-allowing-me-to-get-session-objects-when-set-from-a
[4] Minimal APIs quick reference - Microsoft Learn https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-9.0
[5] Is it possible to access HttpContext.Current.Session from Web API https://stackoverflow.com/questions/19884619/is-it-possible-to-access-httpcontext-current-session-from-web-api/24212662
[6] Session management in ASP.NET (5/6) API? : r/aspnetcore - Reddit https://www.reddit.com/r/aspnetcore/comments/q2axm7/session_management_in_aspnet_56_api/
[7] .NET Core API with Windows Authentication | Single Sign- ... https://www.youtube.com/watch?v=wJZaSDgepcY
[8] GitHub - continuedev/continue https://github.com/continuedev/continue
[9] ASP.NET Core Middleware | Microsoft Learn https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-9.0
[10] Windows authentication (SSO) for intranet users and form ... https://stackoverflow.com/questions/76155031/windows-authentication-sso-for-intranet-users-and-form-auth-for-internet-users
