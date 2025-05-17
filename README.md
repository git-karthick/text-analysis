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