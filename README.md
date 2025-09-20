Here is a complete, practical example showing how to implement claims-based user context in a Clean Architecture .NET Core Web API project. This includes: claims transformation, context interface, implementation, DI setup, and usage in the core/service layer—while avoiding dependencies on framework types in your Core logic[1][2][3].

***

### 1. Define User Context Interface (Core Project)
```csharp
// Core Layer (Project.Core)
public interface ICurrentUser
{
    string UserId { get; }
    IEnumerable<string> Roles { get; }
    bool IsAuthenticated { get; }
}
```

***

### 2. Implement User Context (API/Infrastructure Layer)
```csharp
// Infrastructure Layer (Project.Infrastructure) or API Layer (Project.API)
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string UserId =>
        _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    public IEnumerable<string> Roles =>
        _httpContextAccessor.HttpContext?.User?
            .FindAll(ClaimTypes.Role)
            .Select(c => c.Value) 
            ?? Enumerable.Empty<string>();

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}
```
You can also implement custom claim access and mapping here if you need extra claims for permissions or other custom attributes[1][2].

***

### 3. Configure Claims Transformation (API Layer)
Suppose roles are loaded from the database:
```csharp
public class CustomClaimsTransformation : IClaimsTransformation
{
    private readonly IRoleService _roleService;
    public CustomClaimsTransformation(IRoleService roleService)
    {
        _roleService = roleService;
    }
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = (ClaimsIdentity)principal.Identity;
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var roles = await _roleService.GetRolesForUserAsync(userId);
        foreach (var role in roles)
        {
            if (!identity.HasClaim(ClaimTypes.Role, role))
                identity.AddClaim(new Claim(ClaimTypes.Role, role));
        }
        return principal;
    }
}

services.AddTransient<IClaimsTransformation, CustomClaimsTransformation>();
```
This logic should be in the API project, not inside Core or Infrastructure[2].

***

### 4. Register Everything with DI (API Layer)
```csharp
// In Startup.cs or Program.cs
services.AddHttpContextAccessor();
services.AddScoped<ICurrentUser, CurrentUser>();
services.AddScoped<IRoleService, RoleService>();
services.AddTransient<IClaimsTransformation, CustomClaimsTransformation>();
```
This ensures all layers have access to the current user context via DI, and claims are set up for each request correctly[1][2].

***

### 5. Usage in Application/Core/Service Logic
```csharp
// Core/Service Layer (Project.Core or Project.Application)
public class MyService
{
    private readonly ICurrentUser _currentUser;
    public MyService(ICurrentUser currentUser)
    {
        _currentUser = currentUser;
    }

    public void DoBusinessLogic()
    {
        var userId = _currentUser.UserId;
        var roles = _currentUser.Roles;

        // Business logic based on roles
        if (roles.Contains("Admin"))
        {
            // Admin-specific logic
        }
    }
}
```
You inject `ICurrentUser` into any service or business logic layer without referencing HttpContext, ClaimsPrincipal, or any framework types[1][3].

***

### Key Architecture Principles
- **ICurrentUser** interface is in Core (no framework dependency).
- API layer sets up claims and implements the interface (using IHttpContextAccessor).
- All service/business logic depends only on ICurrentUser, not on external web types.
- Claims transformation and retrieval are handled on the web/API boundary[1][2][3].

This approach is scalable, clean, and fully in line with Clean Architecture best practices for ASP.NET Core projects[1][2][3].

Sources
[1] Getting the Current User in Clean Architecture https://www.milanjovanovic.tech/blog/getting-the-current-user-in-clean-architecture
[2] Master Claims Transformation for Flexible ASP.NET Core ... https://www.milanjovanovic.tech/blog/master-claims-transformation-for-flexible-aspnetcore-authorization
[3] Clean Architecture and Asp.Net Core Identity https://stackoverflow.com/questions/62865530/clean-architecture-and-asp-net-core-identity
