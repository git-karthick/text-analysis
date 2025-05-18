Here's how to implement **logging to both text files and a database exception table** in your .NET 8 application:

---

### **1. Database Table for Exceptions**
Create a table to store exceptions:
```sql
CREATE TABLE ErrorLogs (
    ErrorId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ErrorMessage NVARCHAR(MAX) NOT NULL,
    StackTrace NVARCHAR(MAX),
    Source NVARCHAR(255),
    Timestamp DATETIME2 DEFAULT GETUTCDATE(),
    UserId INT NULL,
    RoutePath NVARCHAR(500),
    HttpMethod NVARCHAR(10),
    StatusCode INT
);
```

---

### **2. Exception Log Model**
```csharp
public class ErrorLog
{
    public Guid ErrorId { get; set; }
    public string ErrorMessage { get; set; }
    public string StackTrace { get; set; }
    public string Source { get; set; }
    public DateTime Timestamp { get; set; }
    public int? UserId { get; set; }
    public string RoutePath { get; set; }
    public string HttpMethod { get; set; }
    public int StatusCode { get; set; }
}
```

---

### **3. Exception Log Repository (Dapper)**
```csharp
public interface IErrorLogRepository
{
    Task LogErrorAsync(ErrorLog error);
}

public class ErrorLogRepository : IErrorLogRepository
{
    private readonly DapperContext _context;

    public ErrorLogRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task LogErrorAsync(ErrorLog error)
    {
        const string sql = """
            INSERT INTO ErrorLogs 
                (ErrorMessage, StackTrace, Source, UserId, RoutePath, HttpMethod, StatusCode)
            VALUES 
                (@ErrorMessage, @StackTrace, @Source, @UserId, @RoutePath, @HttpMethod, @StatusCode)
            """;

        using var connection = _context.CreateConnection();
        await connection.ExecuteAsync(sql, error);
    }
}
```

---

### **4. Configure File Logging with Serilog**
Install NuGet packages:
```bash
Install-Package Serilog
Install-Package Serilog.Sinks.File
Install-Package Serilog.Sinks.Console
```

**appsettings.json**:
```json
{
  "Serilog": {
    "Using": ["Serilog.Sinks.File"],
    "MinimumLevel": "Information",
    "WriteTo": [
      {
        "Name": "File",
        "Args": {
          "path": "Logs/log-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 7,
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level}] {Message}{NewLine}{Exception}"
        }
      }
    ]
  }
}
```

---

### **5. Updated Global Exception Middleware**
```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IErrorLogRepository _errorLogRepository;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        IErrorLogRepository errorLogRepository,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _errorLogRepository = errorLogRepository;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            // Log to text file using Serilog
            _logger.LogError(ex, "Global exception handler caught error");
            
            // Log to database
            await LogToDatabase(context, ex);
            
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task LogToDatabase(HttpContext context, Exception ex)
    {
        try
        {
            var error = new ErrorLog
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace,
                Source = ex.Source,
                Timestamp = DateTime.UtcNow,
                UserId = await GetUserIdFromRequest(context.Request),
                RoutePath = context.Request.Path,
                HttpMethod = context.Request.Method,
                StatusCode = context.Response.StatusCode
            };

            await _errorLogRepository.LogErrorAsync(error);
        }
        catch (Exception loggingEx)
        {
            _logger.LogCritical(loggingEx, "Failed to log error to database");
        }
    }

    private async Task<int?> GetUserIdFromRequest(HttpRequest request)
    {
        try
        {
            request.EnableBuffering();
            using var reader = new StreamReader(request.Body);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;
            
            var json = JObject.Parse(body);
            return json["userId"]?.Value<int>();
        }
        catch
        {
            return null;
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var statusCode = ex is UserFriendlyException ufe ? ufe.StatusCode : 500;
        var message = ex is UserFriendlyException ? ex.Message : "An unexpected error occurred";

        context.Response.StatusCode = statusCode;
        return context.Response.WriteAsJsonAsync(new
        {
            error = message,
            status = statusCode
        });
    }
}
```

---

### **6. Program.cs Configuration**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<IErrorLogRepository, ErrorLogRepository>();
builder.Services.AddScoped<IUserService, UserService>();

// Exception handling (already registered via middleware)
var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseSerilogRequestLogging(); // Optional HTTP request logging

// ... rest of middleware
```

---

### **7. Log Output Examples**

**Text File (Logs/log-20231025.txt)**:
```
2023-10-25 14:30:45.123 +00:00 [Error] Global exception handler caught error
System.Exception: Example error
   at MyApp.Controllers.WeatherController.Get() in ...
```

**Database Record**:
```sql
SELECT * FROM ErrorLogs;
/*
ErrorId: 6A3B4E82-..., 
ErrorMessage: "Example error", 
Source: "MyApp.Controllers.WeatherController", 
UserId: 1234, 
RoutePath: "/api/weather", 
HttpMethod: "GET", 
StatusCode: 500
*/
```

---

### **Key Features**
1. **Dual Logging**:  
   - Text files for quick access/rotation  
   - Database for structured querying  

2. **Error Context**:  
   - Captures user ID from request body  
   - Includes route and HTTP method  

3. **Fault Tolerance**:  
   - Safe-guards against logging failures  
   - Async/await for non-blocking operations  

4. **Serilog Integration**:  
   - Standardized log format  
   - Daily file rotation  
   - Built-in log cleaning  

5. **Performance**:  
   - Dapper for fast DB inserts  
   - Connection pooling via DapperContext  

---

### **Usage Patterns**
1. **Controller Logging**:
```csharp
public class WeatherController : ControllerBase
{
    private readonly ILogger<WeatherController> _logger;

    public WeatherController(ILogger<WeatherController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Get()
    {
        _logger.LogInformation("Fetching weather data");
        // Your logic
    }
}
```

2. **Manual Logging**:
```csharp
try
{
    // Risky operation
}
catch (Exception ex)
{
    _logger.LogError(ex, "Failed to process order");
    throw new UserFriendlyException(500, "Order processing failed");
}
```

---

This implementation provides robust, production-ready logging with minimal performance overhead while maintaining user-friendly error responses.