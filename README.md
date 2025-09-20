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


--------
Here is a full implementation example of using `IClaimsTransformation` in your Clean Architecture project structure (API, Core, Infrastructure) to load user roles from the database and add them as claims:

***

### 1. Define User Entity and Role Service (Infrastructure Layer)

```csharp
// Infrastructure/Entities/User.cs
public class User
{
    public string UserId { get; set; }
    public string UserName { get; set; }
    public List<string> Roles { get; set; }
}

// Infrastructure/Services/UserRepository.cs
public interface IUserRepository
{
    Task<User> GetUserByUserNameAsync(string userName);
}

public class UserRepository : IUserRepository
{
    // Implement database fetch logic here
    public async Task<User> GetUserByUserNameAsync(string userName)
    {
        // Fetch user with roles from DB, example only
        return new User
        {
            UserId = "123",
            UserName = userName,
            Roles = new List<string> { "Admin", "User" }
        };
    }
}
```

***

### 2. Create Claims Transformation (API Layer)

```csharp
// API/Services/DbClaimsTransformation.cs
using Microsoft.AspNetCore.Authentication;

public class DbClaimsTransformation : IClaimsTransformation
{
    private readonly IUserRepository _userRepository;

    public DbClaimsTransformation(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = (ClaimsIdentity)principal.Identity;
        var userName = principal.Identity?.Name;

        if (!string.IsNullOrEmpty(userName) && !identity.HasClaim(c => c.Type == ClaimTypes.Role))
        {
            var user = await _userRepository.GetUserByUserNameAsync(userName);
            
            if (user?.Roles != null)
            {
                foreach (var role in user.Roles)
                {
                    identity.AddClaim(new Claim(ClaimTypes.Role, role));
                }
            }
        }
        return principal;
    }
}
```

***

### 3. Implement User Context Abstraction (Core Project)

```csharp
// Core/Interfaces/ICurrentUser.cs
public interface ICurrentUser
{
    string UserId { get; }
    IEnumerable<string> Roles { get; }
    bool IsAuthenticated { get; }
}
```

***

### 4. Implement User Context (Infrastructure or API Layer)

```csharp
// Infrastructure/Services/CurrentUser.cs
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string UserId => _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    public IEnumerable<string> Roles =>
        _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value) ?? Enumerable.Empty<string>();

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
```

***

### 5. Register Dependencies in API Startup

```csharp
// API/Program.cs or Startup.cs (ConfigureServices)
services.AddHttpContextAccessor();
services.AddScoped<IUserRepository, UserRepository>();
services.AddScoped<ICurrentUser, CurrentUser>();
services.AddTransient<IClaimsTransformation, DbClaimsTransformation>();
```

***

### 6. Usage Example in Core Service

```csharp
// Core/Services/MyService.cs
public class MyService
{
    private readonly ICurrentUser _currentUser;

    public MyService(ICurrentUser currentUser)
    {
        _currentUser = currentUser;
    }

    public void ExecuteBusinessLogic()
    {
        if (_currentUser.IsAuthenticated)
        {
            var roles = _currentUser.Roles;

            if (roles.Contains("Admin"))
            {
                // Admin-specific logic here
            }
        }
    }
}
```

***

### Summary:

- Your **API layer** hosts the actual `IClaimsTransformation` implementation that queries the database for user roles.
- Your **Infrastructure layer** implements user data access (repository) and the user context wrapper (`CurrentUser`).
- Your **Core layer** defines only the `ICurrentUser` interface and depends on it in your business logic.
- This clean separation aligns well with your project structure and Clean Architecture principles.

This setup makes your app flexible, testable, and neatly separates concerns across layers[1][2][3].

Sources
[1] Getting the Current User in Clean Architecture https://www.milanjovanovic.tech/blog/getting-the-current-user-in-clean-architecture
[2] Master Claims Transformation for Flexible ASP.NET Core ... https://www.milanjovanovic.tech/blog/master-claims-transformation-for-flexible-aspnetcore-authorization
[3] Clean Architecture and Asp.Net Core Identity https://stackoverflow.com/questions/62865530/clean-architecture-and-asp-net-core-identity

