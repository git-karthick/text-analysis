### Implementing User Impersonation in .NET 8 API for Testing

Based on your .NET 8 API setup with Windows Authentication (and plans for SSO), adding impersonation for testing allows an authorized user (like an admin) to temporarily "login" as another user without knowing their credentials. This is useful for debugging permissions or support scenarios. However, ASP.NET Core doesn't support native impersonation like older .NET versions—apps run under the process identity[1]. Instead, you can simulate it by creating a new authentication principal with the target user's claims and signing them in, often using cookies or tokens.

This approach works with your existing Windows Auth setup and can adapt to SSO (e.g., by pulling claims from an identity provider). I'll focus on a cookie-based implementation for stateful sessions, as it builds on your prior session middleware. For stateless APIs, you could extend this to JWT tokens.

#### Step 1: Add Required Services
In `Program.cs`, ensure you have authentication and authorization services. Update to include policy-based checks for admins:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Existing session and auth setup...
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options => { /* your options */ });

builder.Services.AddAuthentication("Windows")
    .AddNegotiate(); // Windows Auth

// For future SSO, add here (e.g., AddOpenIdConnect)

// Add authorization with an admin policy
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

// Inject UserManager if using Identity (optional, for user lookup)
builder.Services.AddIdentityCore<ApplicationUser>(options => { /* config */ })
    .AddUserManager<UserManager<ApplicationUser>>()
    .AddSignInManager<SignInManager<ApplicationUser>>();

var app = builder.Build();

// Middleware order: Routing > Auth > Session > Your custom middleware
app.UseAuthentication();
app.UseAuthorization();
app.UseSession();
app.UseMiddleware<SessionStartMiddleware>(); // From previous code

app.Run();
```

#### Step 2: Create an Impersonation Controller
Add a controller for starting and stopping impersonation. Restrict it to admins. This uses `SignInManager` to create a new principal for the target user[2].

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")] // Only admins can impersonate
public class ImpersonationController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public ImpersonationController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("start/{userId}")]
    public async Task<IActionResult> StartImpersonation(string userId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Or User.Identity.Name for Windows Auth

        var targetUser = await _userManager.FindByIdAsync(userId);
        if (targetUser == null) return NotFound("User not found");

        // Create principal for target user
        var targetPrincipal = await _signInManager.CreateUserPrincipalAsync(targetUser);

        // Add claims to track impersonation
        targetPrincipal.Identities.First().AddClaim(new Claim("OriginalUserId", currentUserId));
        targetPrincipal.Identities.First().AddClaim(new Claim("IsImpersonating", "true"));

        // Sign out current and sign in as target
        await _signInManager.SignOutAsync();
        await HttpContext.SignInAsync(IdentityConstants.ApplicationScheme, targetPrincipal);

        // Optionally, update session or call your procedure
        HttpContext.Session.SetString("ImpersonatedUser", userId);

        return Ok($"Now impersonating {targetUser.UserName}");
    }

    [HttpPost("stop")]
    public async Task<IActionResult> StopImpersonation()
    {
        if (!User.HasClaim("IsImpersonating", "true")) return BadRequest("Not impersonating");

        var originalUserId = User.FindFirstValue("OriginalUserId");
        var originalUser = await _userManager.FindByIdAsync(originalUserId);
        if (originalUser == null) return NotFound("Original user not found");

        // Create principal for original user
        var originalPrincipal = await _signInManager.CreateUserPrincipalAsync(originalUser);

        // Sign out impersonated and sign back in as original
        await _signInManager.SignOutAsync();
        await HttpContext.SignInAsync(IdentityConstants.ApplicationScheme, originalPrincipal);

        HttpContext.Session.Remove("ImpersonatedUser");

        return Ok("Impersonation stopped");
    }
}
```

#### Step 3: Integrate with Your Session Middleware
Update your `SessionStartMiddleware` to handle impersonation. Check for the "IsImpersonating" claim and log or adjust the procedure call accordingly[3][2].

```csharp
public async Task InvokeAsync(HttpContext context)
{
    const string sessionFlagKey = "SessionStarted";
    if (string.IsNullOrEmpty(context.Session.GetString(sessionFlagKey)))
    {
        string userId = context.User.Identity?.Name; // Windows Auth fallback

        // If impersonating, use the impersonated user's ID
        if (context.User.HasClaim("IsImpersonating", "true"))
        {
            userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier); // Or custom claim
        }
        // For SSO, adapt to claims like "sub" or "preferred_username"

        if (!string.IsNullOrEmpty(userId))
        {
            await CallYourProcedureAsync(userId);
        }

        context.Session.SetString(sessionFlagKey, "true");
    }

    await _next(context);
}
```

#### Testing and Security Notes
- **Usage**: As an admin, call `POST /api/impersonation/start/{targetUserId}` to start, and `POST /api/impersonation/stop` to revert. This switches the auth context for subsequent requests.
- **Windows Auth Adaptation**: For pure Windows impersonation (e.g., accessing resources as another Windows user), use `WindowsIdentity.RunImpersonated` in specific code blocks, but you'll need the target user's credentials (not ideal for testing without passwords)[4][5]. The above is safer for API-level simulation.
- **SSO Compatibility**: When adding SSO, ensure the `UserManager` pulls from your identity provider. Claims like "OriginalUserId" persist across auth schemes.
- **Risks**: Limit to testing environments. Impersonation can expose sensitive data, so audit logs and restrict access. Avoid in production without safeguards.
- **Alternatives**: For stateless APIs, generate a JWT with the target user's claims instead of cookies.

This setup integrates with your existing code and supports both Windows and future SSO[3][2][6].

Sources
[1] Impersonating user in asp.net core - Stack Overflow https://stackoverflow.com/questions/68579818/impersonating-user-in-asp-net-core
[2] User impersonation in Asp.Net Core - Trailmax Tech https://tech.trailmax.info/2017/07/user-impersonation-in-asp-net-core/
[3] Implement impersonation in an ASP.NET application - Microsoft Learn https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/aspnet/development/implement-impersonation
[4] Impersonation without password in .NET Core · Issue #5021 - GitHub https://github.com/dotnet/core/issues/5021
[5] Impersonating and Reverting - .NET - Microsoft Learn https://learn.microsoft.com/en-us/dotnet/standard/security/impersonating-and-reverting
[6] Adding user impersonation to an ASP.NET Core web application https://www.thereformedprogrammer.net/adding-user-impersonation-to-an-asp-net-core-web-application/

### Implementing Flexible User Impersonation in .NET 8 API

To support impersonation in your .NET 8 API with current Windows Authentication while preparing for future SSO (e.g., via OpenID Connect or Azure AD), focus on a claims-based approach. This simulates impersonation by creating a new authentication principal for the target user, which works across auth schemes. It doesn't require passwords and relies on admin privileges to switch contexts.

Windows Auth provides the user identity via `WindowsIdentity`, but for SSO, you'll use claims like "sub" or "preferred_username". The code below uses ASP.NET Core Identity for user management (adaptable to your user store) and signs in with cookies for session tracking. For stateless APIs, you could swap to JWTs.

#### Prerequisites
- Install packages: `Microsoft.AspNetCore.Identity.EntityFrameworkCore` (if using EF for users) and ensure your app has a user store (e.g., database with `ApplicationUser` class extending `IdentityUser`).
- This builds on your existing setup with sessions and Windows Auth.

#### Step 1: Configure Services in Program.cs
Update `Program.cs` to include Identity, authentication, and an admin policy. Add SSO placeholders for future integration.

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore; // If using EF

var builder = WebApplication.CreateBuilder(args);

// Add Identity services (adapt to your DbContext)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Session setup (from your previous code)
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Authentication: Windows now, SSO later
builder.Services.AddAuthentication("Windows")
    .AddNegotiate(); // Windows Auth

// Future SSO (uncomment and configure when ready):
// builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
//     .AddOpenIdConnect(options =>
//     {
//         options.Authority = "https://your-sso-provider.com";
//         options.ClientId = "your-client-id";
//         options.ClientSecret = "your-secret";
//         options.ResponseType = "code";
//         options.SaveTokens = true;
//         // Map claims as needed
//     });

// Authorization policy for admins
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

var app = builder.Build();

// Middleware pipeline
app.UseAuthentication();
app.UseAuthorization();
app.UseSession();
app.UseMiddleware<SessionStartMiddleware>(); // Your custom middleware from before

app.MapControllers();
app.Run();
```

#### Step 2: Impersonation Controller
Create a controller for starting/stopping impersonation. It uses `SignInManager` to handle sign-ins, pulling user details from Identity. For Windows Auth, it falls back to `User.Identity.Name`; for SSO, it uses claims.

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")] // Restrict to admins
public class ImpersonationController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public ImpersonationController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("start/{targetUserId}")]
    public async Task<IActionResult> StartImpersonation(string targetUserId)
    {
        // Get current user ID (Windows Auth fallback, SSO uses claims)
        string currentUserId = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        var targetUser = await _userManager.FindByIdAsync(targetUserId);
        if (targetUser == null) return NotFound("Target user not found");

        // Create principal for target user
        var targetPrincipal = await _signInManager.CreateUserPrincipalAsync(targetUser);

        // Track impersonation with custom claims
        targetPrincipal.Identities.First().AddClaim(new Claim("OriginalUserId", currentUserId));
        targetPrincipal.Identities.First().AddClaim(new Claim("IsImpersonating", "true"));

        // Sign out current session and sign in as target
        await _signInManager.SignOutAsync();
        await _signInManager.SignInAsync(targetUser, isPersistent: false); // Or use HttpContext.SignInAsync for custom schemes

        // Update session if needed
        HttpContext.Session.SetString("ImpersonatedUser", targetUserId);

        return Ok($"Impersonating {targetUser.UserName}");
    }

    [HttpPost("stop")]
    public async Task<IActionResult> StopImpersonation()
    {
        if (!User.HasClaim("IsImpersonating", "true")) return BadRequest("Not currently impersonating");

        string originalUserId = User.FindFirstValue("OriginalUserId");
        var originalUser = await _userManager.FindByIdAsync(originalUserId);
        if (originalUser == null) return NotFound("Original user not found");

        // Sign out impersonated session and sign back in as original
        await _signInManager.SignOutAsync();
        await _signInManager.SignInAsync(originalUser, isPersistent: false);

        HttpContext.Session.Remove("ImpersonatedUser");

        return Ok("Impersonation stopped");
    }
}
```

#### Step 3: Update Session Middleware for Impersonation
Adapt your existing `SessionStartMiddleware` to detect impersonation and use the appropriate user ID.

```csharp
public async Task InvokeAsync(HttpContext context)
{
    const string sessionFlagKey = "SessionStarted";
    if (string.IsNullOrEmpty(context.Session.GetString(sessionFlagKey)))
    {
        // Default to Windows Auth
        string userId = context.User.Identity?.Name;

        // If impersonating, use the target user's ID
        if (context.User.HasClaim("IsImpersonating", "true"))
        {
            userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        }
        // For SSO, this claims check will naturally adapt (e.g., use "sub" claim if needed)

        if (!string.IsNullOrEmpty(userId))
        {
            await CallYourProcedureAsync(userId);
        }

        context.Session.SetString(sessionFlagKey, "true");
    }

    await _next(context);
}
```

#### Usage and Testing
- **Start Impersonation**: As an admin, POST to `/api/impersonation/start/{targetUserId}`.
- **Stop**: POST to `/api/impersonation/stop`.
- **Windows Auth**: It uses `User.Identity.Name` by default.
- **SSO Transition**: When you add SSO, update the auth services and claims mapping. The code will use SSO claims without changes, as long as your user store integrates with the identity provider.
- **Security**: Use this only for testing—log all impersonations and ensure HTTPS. For resource-level Windows impersonation (e.g., file access), wrap code in `WindowsIdentity.RunImpersonated` blocks, but that requires credentials[1][2].

This keeps your app flexible for the SSO shift while working seamlessly with Windows Auth[3][4].

Sources
[1] Implement impersonation in an ASP.NET application - Microsoft Learn https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/aspnet/development/implement-impersonation
[2] Impersonating and Reverting - .NET - Microsoft Learn https://learn.microsoft.com/en-us/dotnet/standard/security/impersonating-and-reverting
[3] User impersonation in Asp.Net Core - Trailmax Tech https://tech.trailmax.info/2017/07/user-impersonation-in-asp-net-core/
[4] Adding user impersonation to an ASP.NET Core web application https://www.thereformedprogrammer.net/adding-user-impersonation-to-an-asp-net-core-web-application/

A clean way to support impersonation without ASP.NET Core Identity is to keep Windows as the primary auth (Negotiate) and add a lightweight cookie scheme that carries an impersonated ClaimsPrincipal; a policy scheme selects the cookie when present, otherwise it falls back to Windows, so no Identity dependency is required and the core logic can remain in a shared project. This works now with **Windows** and is easy to extend to SSO later by adding another scheme while keeping the same impersonation cookie approach.[1][2][3][4][5]

## Design overview
- Use Negotiate for Windows Authentication to populate HttpContext.User for normal requests.[3][5]
- Add a cookie scheme (for example, "Impersonation") that signs in a fabricated ClaimsPrincipal from the custom user table; no ASP.NET Core Identity needed.[6][4]
- Add a policy scheme as the default authentication scheme that routes to the impersonation cookie if that cookie exists on the request; otherwise route to Negotiate, keeping behavior seamless.[2][1]
- Keep user lookup and “procedure” logic in a core project service; controllers and middleware just call that service.[1]

## Auth configuration (Program.cs)
```csharp
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Negotiate;

var builder = WebApplication.CreateBuilder(args);

// Core services from the shared/core project
builder.Services.AddScoped<IUserDirectory, UserDirectory>();           // custom user table lookup
builder.Services.AddScoped<IImpersonationClaimsFactory, ImpersonationClaimsFactory>();
builder.Services.AddScoped<IProcedureService, ProcedureService>();

// Sessions (optional, if already used)
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(o =>
{
    o.IdleTimeout = TimeSpan.FromMinutes(30);
    o.Cookie.HttpOnly = true;
    o.Cookie.IsEssential = true;
});

// Authentication: dynamic default (cookie if present, else Windows)
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Dynamic";
    options.DefaultChallengeScheme = "Dynamic";
})
.AddPolicyScheme("Dynamic", "Dynamic", options =>
{
    options.ForwardDefaultSelector = context =>
    {
        // choose cookie if impersonation cookie exists, else Windows Negotiate
        return context.Request.Cookies.ContainsKey(".Impersonation") 
            ? "Impersonation" 
            : NegotiateDefaults.AuthenticationScheme;
    };
})
.AddNegotiate() // Windows Authentication
.AddCookie("Impersonation", options =>
{
    options.Cookie.Name = ".Impersonation";
    options.SlidingExpiration = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.Events = new CookieAuthenticationEvents
    {
        // Optional: harden cookie usage
        OnValidatePrincipal = ctx => Task.CompletedTask
    };
});

builder.Services.AddAuthorization();

// Pipeline
var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

// Optional: session-start middleware that calls the procedure
app.UseMiddleware<SessionStartMiddleware>();

app.MapControllers();
app.Run();
```
This uses Negotiate for Windows and a cookie scheme for impersonation, with a policy scheme (“Dynamic”) that chooses the cookie when present, otherwise Windows; the cookie approach avoids ASP.NET Core Identity entirely.[4][5][2][3]

## Impersonation controller (no Identity)
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize] // add a stricter policy if needed (e.g., only helpdesk/admins)
public class ImpersonationController : ControllerBase
{
    private readonly IUserDirectory _users;
    private readonly IImpersonationClaimsFactory _claimsFactory;
    private readonly IProcedureService _procedure;

    public ImpersonationController(
        IUserDirectory users,
        IImpersonationClaimsFactory claimsFactory,
        IProcedureService procedure)
    {
        _users = users;
        _claimsFactory = claimsFactory;
        _procedure = procedure;
    }

    // Start impersonation by login name or internal user id from custom user table
    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartImpersonationRequest req)
    {
        // Original (Windows) user
        var originalLogin = User.Identity?.Name ?? "unknown";

        // Lookup target user in custom table
        var targetUser = await _users.FindAsync(req.UserIdentifier); // e.g., "domain\\jdoe" or internal ID
        if (targetUser == null) return NotFound("Target user not found");

        // Build impersonation claims
        var claims = _claimsFactory.Create(targetUser);
        claims.Add(new Claim("impersonation:is", "true"));
        claims.Add(new Claim("impersonation:original", originalLogin));

        var identity = new ClaimsIdentity(claims, authenticationType: "Impersonation");
        var principal = new ClaimsPrincipal(identity);

        // Sign in using the impersonation cookie scheme
        await HttpContext.SignInAsync("Impersonation", principal, new AuthenticationProperties
        {
            IsPersistent = false,
            AllowRefresh = true
        });

        // Write session keys (optional)
        HttpContext.Session.SetString("ImpersonatedUser", targetUser.Id);
        HttpContext.Session.Remove("SessionStarted"); // force next request to re-run session-start logic

        // Immediately trigger the procedure (if needed now) with impersonated user
        await _procedure.OnSessionStartAsync(targetUser.Id);

        return Ok(new { message = $"Impersonating {targetUser.DisplayName}" });
    }

    [HttpPost("stop")]
    public async Task<IActionResult> Stop()
    {
        // Read original user from current cookie principal (if any)
        var original = User.FindFirst("impersonation:original")?.Value ?? User.Identity?.Name ?? "unknown";

        // Sign out of impersonation cookie to fall back to Windows automatically
        await HttpContext.SignOutAsync("Impersonation");

        // Clear session indicators
        HttpContext.Session.Remove("ImpersonatedUser");
        HttpContext.Session.Remove("SessionStarted"); // force next request to re-run session-start logic

        // Optionally trigger procedure for original user context
        await _procedure.OnSessionStartAsync(original);

        return Ok(new { message = "Impersonation stopped" });
    }
}

public sealed class StartImpersonationRequest
{
    public string UserIdentifier { get; set; } = string.Empty; // e.g., login or custom id
}
```
This signs in an impersonation ClaimsPrincipal using only the cookie scheme, with the policy scheme ensuring it overrides Windows only while the cookie exists.[2][4][1]

## Session middleware (uses cookie or Windows)
```csharp
using System.Security.Claims;

public sealed class SessionStartMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IProcedureService _procedure;

    public SessionStartMiddleware(RequestDelegate next, IProcedureService procedure)
    {
        _next = next;
        _procedure = procedure;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        const string flag = "SessionStarted";

        if (string.IsNullOrEmpty(context.Session.GetString(flag)))
        {
            string? effectiveUserId = null;

            // Prefer impersonated user id in claims (from custom user table)
            if (context.User?.Identity?.IsAuthenticated == true &&
                context.User.HasClaim(c => c.Type == ClaimTypes.NameIdentifier) &&
                context.User.HasClaim(c => c.Type == "impersonation:is" && c.Value == "true"))
            {
                effectiveUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            }
            else
            {
                // Fall back to Windows login name
                effectiveUserId = context.User?.Identity?.Name;
            }

            if (!string.IsNullOrWhiteSpace(effectiveUserId))
            {
                await _procedure.OnSessionStartAsync(effectiveUserId);
            }

            context.Session.SetString(flag, "true");
        }

        await _next(context);
    }
}
```
The middleware prefers the impersonated identity from the cookie; otherwise it uses Windows’ HttpContext.User from Negotiate, and it can be left in the API while sharing core business logic through a service.[5][4][1]

## Core services (in the core/shared project)
```csharp
public interface IUserDirectory
{
    Task<AppUser?> FindAsync(string userIdentifier);
}

// Convert your custom user to a consistent claim set for the cookie
public interface IImpersonationClaimsFactory
{
    List<Claim> Create(AppUser user);
}

public interface IProcedureService
{
    Task OnSessionStartAsync(string userIdOrLogin);
}

// Example implementations (simplified)
public sealed class ImpersonationClaimsFactory : IImpersonationClaimsFactory
{
    public List<Claim> Create(AppUser user)
    {
        var claims = new List<Claim>
        {
            // NameIdentifier should carry your stable internal user id (or login if that's the key)
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Login),             // display/login
            new Claim("display_name", user.DisplayName ?? user.Login)
        };

        // Add roles/groups if needed for authorization
        foreach (var role in user.Roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        return claims;
    }
}

public sealed class ProcedureService : IProcedureService
{
    public Task OnSessionStartAsync(string userIdOrLogin)
    {
        // Call the stored procedure / audit / logging / etc.
        return Task.CompletedTask;
    }
}
```
Keeping user lookup and claim shaping in the core project makes the controller thin, and the same service is reused by middleware for immediate and per-request flows.[1]

## Why this works and scales to SSO
- Negotiate remains the authoritative Windows auth; the app only “overrides” with a cookie when impersonating, chosen via a policy scheme at runtime per request.[5][2]
- The impersonation cookie is created via SignInAsync on a ClaimsPrincipal—no ASP.NET Core Identity required.[6][4]
- To add SSO later, register OIDC/JWT and adjust the policy scheme selector to prefer the impersonation cookie first, then SSO, else Windows, without changing the impersonation controller or core services.[2][1]

## Notes
- Only privileged users should be allowed to start/stop impersonation, enforced by authorization policies or Windows groups.[1]
- Ensure Data Protection is configured when running multiple instances so the cookie can be decrypted everywhere.[4]
- Negotiate specifics vary by hosting (IIS, Kestrel, HTTP.sys); follow the Windows auth doc for server-side configuration.[5]

[1](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-9.0)
[2](https://weblog.west-wind.com/posts/2022/Mar/29/Combining-Bearer-Token-and-Cookie-Authentication-in-ASPNET)
[3](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.negotiate?view=aspnetcore-9.0)
[4](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie?view=aspnetcore-9.0)
[5](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/windowsauth?view=aspnetcore-9.0)
[6](https://www.meziantou.net/cookie-authentication-in-asp-net-core-2-without-asp-net-identity.htm)
[7](https://stackoverflow.com/questions/78920752/net-core-multiple-cookie-authentication-schemes)
[8](https://learn.microsoft.com/en-us/aspnet/core/security/cookie-sharing?view=aspnetcore-9.0)
[9](https://code-maze.com/dotnet-multiple-authentication-schemes/)
[10](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.Negotiate/10.0.0-preview.5.25277.114)
[11](https://www.youtube.com/watch?v=dsuPRZ6V9Xg)
[12](https://www.reddit.com/r/dotnet/comments/1c4ikrk/combine_windows_authentication_with_aspnet_core/)
[13](https://stackoverflow.com/questions/65690233/failing-to-perform-cookie-authentication-signinasync-and-authenticateasync-not)
[14](https://dario.griffo.io/posts/multiple-authentication-dotnet/)
[15](https://stackoverflow.com/questions/68916846/how-to-use-windows-authentication-on-asp-net-core-subpath-only)
[16](https://learn.microsoft.com/en-us/answers/questions/2169294/cookie-authentication-without-asp)net-core-identiy)
[17](https://www.youtube.com/watch?v=Cet54urCj70)
[18](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.Negotiate)
[19](https://www.c-sharpcorner.com/article/cookie-authentication-in-asp-net-core/)
[20](https://docs.duendesoftware.com/identityserver/ui/login/windows/)

