Here's a **clean, reusable solution** for role-based authorization in your .NET 8 API where the user ID is passed exclusively in the request body and multiple roles are checked from the database:

---

### **1. Create a Custom Authorization Attribute**
Define an attribute to specify allowed roles for endpoints:
```csharp
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class AuthorizeRolesAttribute : AuthorizeAttribute
{
    public AuthorizeRolesAttribute(params string[] roles)
    {
        Policy = $"RolesPolicy:{string.Join(",", roles)}";
    }
}
```

---

### **2. Implement Authorization Logic**
#### **Step 2a: Create Authorization Requirements**
```csharp
public class RolesRequirement : IAuthorizationRequirement
{
    public string[] RequiredRoles { get; }
    public RolesRequirement(string[] roles) => RequiredRoles = roles;
}
```

#### **Step 2b: Build Authorization Handler**
```csharp
public class RolesAuthorizationHandler : AuthorizationHandler<RolesRequirement>
{
    private readonly IUserRoleService _roleService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public RolesAuthorizationHandler(
        IUserRoleService roleService,
        IHttpContextAccessor httpContextAccessor)
    {
        _roleService = roleService;
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RolesRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var userId = await ExtractUserIdFromRequestBody(httpContext.Request);

        if (userId == 0)
        {
            context.Fail();
            return;
        }

        var userRoles = await _roleService.GetUserRoles(userId);
        var hasRequiredRole = requirement.RequiredRoles
            .Any(requiredRole => userRoles.Contains(requiredRole));

        if (hasRequiredRole)
        {
            context.Succeed(requirement);
        }
        else
        {
            context.Fail();
        }
    }

    private async Task<int> ExtractUserIdFromRequestBody(HttpRequest request)
    {
        try
        {
            // Enable buffering to read body multiple times
            request.EnableBuffering();
            
            using var reader = new StreamReader(request.Body, Encoding.UTF8);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;

            var json = JObject.Parse(body);
            return json["userId"]?.Value<int>() ?? 0;
        }
        catch
        {
            return 0;
        }
    }
}
```

---

### **3. Create Role Service with Caching**
```csharp
public interface IUserRoleService
{
    Task<List<string>> GetUserRoles(int userId);
}

public class UserRoleService : IUserRoleService
{
    private readonly AppDbContext _dbContext;
    private readonly IMemoryCache _cache;

    public UserRoleService(AppDbContext dbContext, IMemoryCache cache)
    {
        _dbContext = dbContext;
        _cache = cache;
    }

    public async Task<List<string>> GetUserRoles(int userId)
    {
        return await _cache.GetOrCreateAsync($"UserRoles_{userId}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            
            return await _dbContext.Users
                .Where(u => u.Id == userId)
                .SelectMany(u => u.Roles.Select(r => r.Name))
                .ToListAsync();
        });
    }
}
```

---

### **4. Configure Services in Program.cs**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Database setup
builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// Authorization setup
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RolesPolicy:*", policy => 
        policy.Requirements.Add(new RolesRequirement(new string[0])));
});

builder.Services.AddSingleton<IAuthorizationHandler, RolesAuthorizationHandler>();
builder.Services.AddScoped<IUserRoleService, UserRoleService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();

var app = builder.Build();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

---

### **5. Use on Controllers/Endpoints**
```csharp
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpPost("create")]
    [AuthorizeRoles("Admin", "OrderManager")] // Multiple allowed roles
    public IActionResult CreateOrder([FromBody] CreateOrderRequest request)
    {
        // Your business logic
        return Ok($"Order created for user {request.UserId}");
    }
}

public class CreateOrderRequest
{
    public int UserId { get; set; }
    // Other properties...
}
```

---

### **How It Works**
1. **Request Flow**:
   - Client sends request with user ID in body
   - Authorization handler extracts user ID from request body
   - Role service checks database (with caching)
   - System verifies if user has any of the required roles

2. **Reusability**:
   - Use `[AuthorizeRoles]` on any controller/method
   - Works for multiple roles (OR logic)
   - Centralized role-checking logic

3. **Security**:
   - Body extraction handles JSON payloads safely
   - Caching reduces database calls
   - Automatic 403 Forbidden responses for failed checks

---

### **Error Handling**
Add this middleware to handle authorization failures:
```csharp
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var errorFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (errorFeature?.Error is AuthorizationFailureException)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("Access forbidden");
        }
    });
});
```

---

### **Key Advantages**
1. **Full Request Body Access**: Safely reads JSON payload without model binding
2. **Role Cache Optimization**: Reduces database hits with 5-minute caching
3. **Flexible Role Checks**: Supports multiple roles per endpoint
4. **Clean Attribute Syntax**: Simple `[AuthorizeRoles("Role1", "Role2")]` usage
5. **Centralized Logic**: One handler for all role-based authorization

This solution provides a secure, performant way to handle role-based authorization using user IDs from request bodies while maintaining code reusability across controllers.


Here's a **project structure** optimized for Dapper instead of Entity Framework, while keeping the same authorization flow:

```plaintext
YourApiProject/
├── Controllers/               # API controllers
│   ├── OrdersController.cs
│   └── ProductsController.cs
├── Authorization/            # Custom auth components
│   ├── AuthorizeRolesAttribute.cs
│   ├── RolesAuthorizationHandler.cs
│   └── RolesRequirement.cs
├── Services/                 # Business logic services
│   ├── UserRoleService.cs
│   └── IUserRoleService.cs
├── Data/                     # Dapper-related classes
│   ├── DapperContext.cs      # Database connection handler
│   ├── Queries/              # SQL queries
│   │   └── UserQueries.sql
│   └── Models/               # Database models
│       ├── User.cs
│       └── Role.cs
├── Requests/                 # Request DTOs
│   └── CreateOrderRequest.cs
├── appsettings.json
└── Program.cs
```

### Key Changes for Dapper:

**1. `Data/DapperContext.cs`** (Replaces Entity Framework DbContext):
```csharp
public class DapperContext
{
    private readonly IConfiguration _configuration;
    
    public DapperContext(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public IDbConnection CreateConnection() 
        => new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
}
```

**2. Updated `Services/UserRoleService.cs`** (Dapper Implementation):
```csharp
public class UserRoleService : IUserRoleService
{
    private readonly DapperContext _context;
    private readonly IMemoryCache _cache;

    public UserRoleService(DapperContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<List<string>> GetUserRoles(int userId)
    {
        return await _cache.GetOrCreateAsync($"UserRoles_{userId}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            
            using var connection = _context.CreateConnection();
            
            const string sql = """
                SELECT r.Name 
                FROM Users u
                INNER JOIN UserRoles ur ON u.Id = ur.UserId
                INNER JOIN Roles r ON ur.RoleId = r.Id
                WHERE u.Id = @UserId
                """;
                
            var roles = await connection.QueryAsync<string>(sql, new { UserId = userId });
            return roles.ToList();
        });
    }
}
```

**3. `Data/Queries/UserQueries.sql`** (Optional - SQL Query Management):
```sql
-- GetUserRoles
SELECT r.Name 
FROM Users u
INNER JOIN UserRoles ur ON u.Id = ur.UserId
INNER JOIN Roles r ON ur.RoleId = r.Id
WHERE u.Id = @UserId
```

**4. Updated `Program.cs` Registration**:
```csharp
var builder = WebApplication.CreateBuilder(args);

// Dapper configuration
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<IUserRoleService, UserRoleService>();

// Rest remains same as previous authorization setup
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RolesPolicy:*", policy => 
        policy.Requirements.Add(new RolesRequirement(Array.Empty<string>()));
});
builder.Services.AddSingleton<IAuthorizationHandler, RolesAuthorizationHandler>();

var app = builder.Build();
// ... rest of middleware
```

### Key Structural Differences from EF Version:
1. **Removed** Entity Framework migrations and `AppDbContext`
2. **Added** `DapperContext` for connection management
3. **Simplified Models** - No EF navigation properties needed
4. **Query Management** - Optional SQL files for better query organization
5. **Direct SQL** in service layer using Dapper's `QueryAsync`

### Security Considerations:
1. **SQL Injection Protection**:  
   Always use parameterized queries with Dapper (as shown in the `GetUserRoles` method)

2. **Connection Management**:  
   The `DapperContext` ensures proper connection disposal

3. **Caching Strategy**:  
   MemoryCache is still valid, but consider Redis for distributed scenarios

This structure maintains the authorization flow while being more lightweight with Dapper. The authorization handler (`RolesAuthorizationHandler`) remains unchanged from the previous solution, demonstrating proper separation of concerns.

Here's the **modified implementation** using your `Role` model class with `RoleId` and `RoleName` instead of strings:

---

### 1. Updated `Role` Model Class
```csharp
public class Role
{
    public int RoleId { get; set; }
    public string RoleName { get; set; }
}
```

---

### 2. Modified `RolesRequirement` Class
```csharp
public class RolesRequirement : IAuthorizationRequirement
{
    public List<Role> RequiredRoles { get; }
    
    public RolesRequirement(IEnumerable<Role> roles)
    {
        RequiredRoles = roles.ToList();
    }
}
```

---

### 3. Updated `AuthorizeRolesAttribute`
```csharp
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class AuthorizeRolesAttribute : AuthorizeAttribute
{
    public AuthorizeRolesAttribute(params string[] roleNames)
    {
        // Convert role names to Role objects with dummy IDs
        var roles = roleNames.Select(name => new Role { RoleName = name }).ToList();
        Policy = $"RolesPolicy:{string.Join(",", roles.Select(r => r.RoleName))}";
    }
}
```

---

### 4. Enhanced `RolesPolicyProvider`
```csharp
public class RolesPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallbackProvider;
    private readonly IRoleRepository _roleRepository;

    public RolesPolicyProvider(
        IOptions<AuthorizationOptions> options,
        IRoleRepository roleRepository)
    {
        _fallbackProvider = new DefaultAuthorizationPolicyProvider(options);
        _roleRepository = roleRepository;
    }

    public async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith("RolesPolicy:"))
        {
            var roleNames = policyName["RolesPolicy:".Length..]
                .Split(',', StringSplitOptions.RemoveEmptyEntries);

            // Fetch actual roles with IDs from database
            var roles = await _roleRepository.GetRolesByNamesAsync(roleNames);
            
            return new AuthorizationPolicyBuilder()
                .AddRequirements(new RolesRequirement(roles))
                .Build();
        }
        return await _fallbackProvider.GetPolicyAsync(policyName);
    }

    // Keep other interface implementations
}
```

---

### 5. New `IRoleRepository` Interface
```csharp
public interface IRoleRepository
{
    Task<List<Role>> GetRolesByNamesAsync(IEnumerable<string> roleNames);
}
```

---

### 6. Dapper Implementation for `RoleRepository`
```csharp
public class RoleRepository : IRoleRepository
{
    private readonly DapperContext _context;

    public RoleRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<List<Role>> GetRolesByNamesAsync(IEnumerable<string> roleNames)
    {
        using var connection = _context.CreateConnection();
        const string sql = """
            SELECT RoleId, RoleName 
            FROM Roles
            WHERE RoleName IN @roleNames
            """;
            
        return (await connection.QueryAsync<Role>(sql, new { roleNames }))
            .ToList();
    }
}
```

---

### 7. Updated `RolesAuthorizationHandler`
```csharp
public class RolesAuthorizationHandler : AuthorizationHandler<RolesRequirement>
{
    private readonly IUserRoleService _roleService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    // Constructor remains same

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RolesRequirement requirement)
    {
        var userId = await ExtractUserIdFromRequest();
        var userRoles = await _roleService.GetUserRoles(userId);

        // Check by both ID and Name for flexibility
        var hasAccess = requirement.RequiredRoles.Any(requiredRole =>
            userRoles.Any(userRole => 
                userRole.RoleId == requiredRole.RoleId || 
                userRole.RoleName == requiredRole.RoleName));

        if (hasAccess) context.Succeed(requirement);
    }
}
```

---

### 8. Updated `UserRoleService` with Dapper
```csharp
public class UserRoleService : IUserRoleService
{
    private readonly DapperContext _context;
    private readonly IMemoryCache _cache;

    public async Task<List<Role>> GetUserRoles(int userId)
    {
        return await _cache.GetOrCreateAsync($"UserRoles_{userId}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            
            using var connection = _context.CreateConnection();
            const string sql = """
                SELECT r.RoleId, r.RoleName 
                FROM UserRoles ur
                INNER JOIN Roles r ON ur.RoleId = r.RoleId
                WHERE ur.UserId = @userId
                """;
                
            return (await connection.QueryAsync<Role>(sql, new { userId }))
                .ToList();
        });
    }
}
```

---

### 9. Final `Program.cs` Setup
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add Dapper context
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();

// Authorization setup
builder.Services.AddSingleton<IAuthorizationPolicyProvider, RolesPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, RolesAuthorizationHandler>();
builder.Services.AddScoped<IUserRoleService, UserRoleService>();

// Other services
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();
```

---

### Key Changes:
1. **Role Model Integration**:  
   - Full role objects with ID/name used in requirements
   - Database calls resolve role names to full objects with IDs

2. **Flexible Matching**:  
   Authorization checks consider both RoleID and RoleName

3. **Database Optimization**:  
   - Role lookup cached in policy provider
   - Batched role queries for multiple roles

4. **Separation of Concerns**:  
   - Dedicated role repository
   - Clear policy resolution flow

---

### Usage Example:
```csharp
[HttpPost("admin-action")]
[AuthorizeRoles("DevAdmin", "SystemAdmin")]
public IActionResult AdminAction([FromBody] AdminRequest request)
{
    // Action logic here
}
```

---

### Flow Explanation:
1. Attribute defines required role **names**
2. Policy provider converts names to full `Role` objects with IDs
3. Handler verifies user has matching roles by **ID or Name**
4. Database queries optimized with Dapper and caching

This implementation provides a robust role system using your model class while maintaining performance and security.


Here's the **corrected implementation** that only uses the user ID to fetch roles and compares against role names, while maintaining your `Role` class structure:

### 1. Simplified `RolesRequirement`
```csharp
public class RolesRequirement : IAuthorizationRequirement
{
    public string[] RequiredRoleNames { get; }
    
    public RolesRequirement(params string[] roleNames)
    {
        RequiredRoleNames = roleNames;
    }
}
```

### 2. Updated `RolesPolicyProvider`
```csharp
public class RolesPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallbackProvider;

    public RolesPolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallbackProvider = new DefaultAuthorizationPolicyProvider(options);
    }

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith("RolesPolicy:", StringComparison.OrdinalIgnoreCase))
        {
            var roleNames = policyName["RolesPolicy:".Length..]
                .Split(',', StringSplitOptions.RemoveEmptyEntries);

            var policy = new AuthorizationPolicyBuilder()
                .AddRequirements(new RolesRequirement(roleNames))
                .Build();

            return Task.FromResult<AuthorizationPolicy?>(policy);
        }
        return _fallbackProvider.GetPolicyAsync(policyName);
    }

    // Keep other interface implementations
}
```

### 3. Optimized `RolesAuthorizationHandler`
```csharp
public class RolesAuthorizationHandler : AuthorizationHandler<RolesRequirement>
{
    private readonly IUserRoleService _roleService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public RolesAuthorizationHandler(
        IUserRoleService roleService,
        IHttpContextAccessor httpContextAccessor)
    {
        _roleService = roleService;
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RolesRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var userId = await ExtractUserIdFromRequestBody(httpContext.Request);

        if (userId == 0)
        {
            context.Fail();
            return;
        }

        // Get full Role objects using ONLY user ID
        var userRoles = await _roleService.GetUserRoles(userId);
        
        // Check if any role names match
        var hasRequiredRole = userRoles
            .Any(ur => requirement.RequiredRoleNames.Contains(ur.RoleName));

        if (hasRequiredRole)
        {
            context.Succeed(requirement);
        }
    }

    private async Task<int> ExtractUserIdFromRequestBody(HttpRequest request)
    {
        // Same extraction logic as before
    }
}
```

### 4. Updated `UserRoleService` with Dapper
```csharp
public class UserRoleService : IUserRoleService
{
    private readonly DapperContext _context;
    private readonly IMemoryCache _cache;

    public async Task<List<Role>> GetUserRoles(int userId)
    {
        return await _cache.GetOrCreateAsync($"UserRoles_{userId}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            
            using var connection = _context.CreateConnection();
            const string sql = """
                SELECT r.RoleId, r.RoleName 
                FROM UserRoles ur
                INNER JOIN Roles r ON ur.RoleId = r.RoleId
                WHERE ur.UserId = @userId
                """;
                
            return (await connection.QueryAsync<Role>(sql, new { userId }))
                .ToList();
        });
    }
}
```

### 5. Simplified `Program.cs`
```csharp
var builder = WebApplication.CreateBuilder(args);

// Dapper configuration
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<IUserRoleService, UserRoleService>();

// Authorization setup
builder.Services.AddSingleton<IAuthorizationPolicyProvider, RolesPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, RolesAuthorizationHandler>();

// Other services
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();
```

### Key Fixes:
1. **Removed Role Name Lookup**  
   No more database calls to resolve role names - only user ID is used to fetch roles

2. **Simplified Requirement**  
   `RolesRequirement` now only stores required role names

3. **Efficient Comparison**  
   Uses role names from requirement against role names from user's roles

4. **Maintained Role Model**  
   Still returns full `Role` objects but only compares names

### Flow Summary:
1. Client sends request with user ID in body
2. Handler extracts user ID from request body
3. Service gets roles **using only user ID** from DB
4. Compares role names from DB against required names in attribute
5. Access granted if any match exists

This implementation properly uses only the user ID to fetch roles while maintaining your role model structure and providing efficient authorization checks.