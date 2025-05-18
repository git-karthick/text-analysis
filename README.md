Here's a **comprehensive error handling implementation** with user-friendly messages for your authorization flow:

### 1. Create Custom Exceptions
```csharp
public class UserFriendlyException : Exception
{
    public int StatusCode { get; }
    public string UserMessage { get; }

    public UserFriendlyException(int statusCode, string userMessage)
        : base(userMessage)
    {
        StatusCode = statusCode;
        UserMessage = userMessage;
    }
}

public class UserIdMissingException : UserFriendlyException
{
    public UserIdMissingException() 
        : base(400, "User ID is required in the request body") {}
}

public class UserNotFoundException : UserFriendlyException
{
    public UserNotFoundException(int userId) 
        : base(404, $"User with ID {userId} not found") {}
}

public class AuthorizationFailedException : UserFriendlyException
{
    public AuthorizationFailedException() 
        : base(403, "You don't have permission to access this resource") {}
}

public class DatabaseConnectionException : UserFriendlyException
{
    public DatabaseConnectionException() 
        : base(503, "Service temporarily unavailable. Please try again later") {}
}
```

### 2. Enhanced UserService with Error Handling
```csharp
public class UserService : IUserService
{
    // ... existing dependencies

    public async Task<User> GetUser(int userId)
    {
        try
        {
            return await _cache.GetOrCreateAsync($"User_{userId}", async entry =>
            {
                // ... existing caching setup

                using var connection = _context.CreateConnection();
                
                try
                {
                    var user = await connection.QueryFirstOrDefaultAsync<User>(sql, new { userId });
                    if (user == null)
                    {
                        throw new UserNotFoundException(userId);
                    }
                    return user;
                }
                catch (SqlException ex)
                {
                    _logger.LogError(ex, "Database error fetching user {UserId}", userId);
                    throw new DatabaseConnectionException();
                }
            });
        }
        catch (UserNotFoundException)
        {
            throw; // Re-throw specific exceptions
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", userId);
            throw new UserFriendlyException(500, "An error occurred while processing your request");
        }
    }
}
```

### 3. Updated Authorization Handler
```csharp
public class RolesAuthorizationHandler : AuthorizationHandler<RolesRequirement>
{
    // ... existing dependencies

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RolesRequirement requirement)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var userId = await ExtractUserIdFromRequestBody(httpContext.Request);

            if (userId == 0)
            {
                throw new UserIdMissingException();
            }

            var user = await _userService.GetUser(userId);
            
            if (!user.Roles.Any(r => requirement.RequiredRoleNames.Contains(r.RoleName)))
            {
                throw new AuthorizationFailedException();
            }

            context.Succeed(requirement);
        }
        catch (UserFriendlyException ex)
        {
            context.Fail(new AuthorizationFailureReason(this, ex.UserMessage));
            throw; // Let middleware handle
        }
    }

    private async Task<int> ExtractUserIdFromRequestBody(HttpRequest request)
    {
        // ... existing extraction logic
        
        if (userId == 0)
        {
            throw new UserIdMissingException();
        }
        return userId;
    }
}
```

### 4. Global Exception Handling Middleware
```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UserFriendlyException ex)
        {
            _logger.LogWarning(ex, "User-friendly error occurred");
            await HandleUserFriendlyException(context, ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleUnknownException(context, ex);
        }
    }

    private static Task HandleUserFriendlyException(HttpContext context, UserFriendlyException ex)
    {
        context.Response.StatusCode = ex.StatusCode;
        return context.Response.WriteAsJsonAsync(new
        {
            error = ex.UserMessage,
            code = ex.StatusCode
        });
    }

    private static Task HandleUnknownException(HttpContext context, Exception ex)
    {
        context.Response.StatusCode = 500;
        return context.Response.WriteAsJsonAsync(new
        {
            error = "An unexpected error occurred",
            code = 500
        });
    }
}
```

### 5. Register Middleware in Program.cs
```csharp
var app = builder.Build();

// Add the middleware early in the pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

// Then other middleware
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### 6. Error Response Structure
All errors will follow this format:
```json
{
  "error": "User-friendly message",
  "code": 400
}
```

### Common Scenarios and Responses

| Scenario                          | Status Code | Message                                      |
|-----------------------------------|-------------|----------------------------------------------|
| Missing user ID in request body   | 400         | User ID is required in the request body      |
| User not found                    | 404         | User with ID {userId} not found              |
| Insufficient permissions          | 403         | You don't have permission to access...       |
| Database connection issues        | 503         | Service temporarily unavailable...           |
| Unexpected errors                 | 500         | An unexpected error occurred                 |

### Usage in Controllers
Controllers remain clean:
```csharp
[HttpPost("secure-action")]
[AuthorizeRoles("Admin")]
public IActionResult SecureAction([FromBody] UserRequest request)
{
    // No try-catch needed
    return Ok("Success!");
}
```

This implementation provides:
1. **Consistent error formats** across all endpoints
2. **Granular error types** for different failure scenarios
3. **Automatic error logging** with proper severity levels
4. **Secure error messages** that don't expose implementation details
5. **Separation of concerns** through middleware and custom exceptions

The error handling propagates naturally through the authorization pipeline while maintaining user-friendly responses at every layer.