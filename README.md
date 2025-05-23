// MyCompany.MyApplication.Domain/Models/User.cs
using System;
using System.Collections.Generic;

namespace MyCompany.MyApplication.Domain.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public List<UserRole> Roles { get; set; } = new List<UserRole>();
    }

    public class UserRole
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime AssignedAt { get; set; }
        public string AssignedBy { get; set; } = string.Empty;
    }

    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new List<string>();
    }
}

// MyCompany.MyApplication.Domain/Models/Product.cs
using System;

namespace MyCompany.MyApplication.Domain.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ProductCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}

// MyCompany.MyApplication.Domain/Models/Order.cs
using System;
using System.Collections.Generic;

namespace MyCompany.MyApplication.Domain.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public enum OrderStatus
    {
        Pending = 1,
        Processing = 2,
        Shipped = 3,
        Delivered = 4,
        Cancelled = 5
    }
}

// MyCompany.MyApplication.Domain/Repositories/IUserRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetByUsernameAsync(string username);
        Task<User> GetByIdAsync(int id);
        Task<IEnumerable<User>> GetAllAsync();
        Task<IEnumerable<Role>> GetAllRolesAsync();
        Task<bool> CreateUserAsync(User user);
        Task<bool> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> AssignRoleToUserAsync(int userId, int roleId, string assignedBy);
        Task<bool> RemoveRoleFromUserAsync(int userId, int roleId);
    }
}

// MyCompany.MyApplication.Domain/Repositories/IProductRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync();
        Task<Product> GetByIdAsync(int id);
        Task<IEnumerable<Product>> GetByCategoryAsync(string category);
        Task<IEnumerable<Product>> SearchAsync(string searchTerm);
        Task<bool> CreateAsync(Product product);
        Task<bool> UpdateAsync(Product product);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<ProductCategory>> GetCategoriesAsync();
    }
}

// MyCompany.MyApplication.Domain/Repositories/IOrderRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Repositories
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Order>> GetAllAsync();
        Task<Order> GetByIdAsync(int id);
        Task<IEnumerable<Order>> GetByCustomerIdAsync(int customerId);
        Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status);
        Task<bool> CreateAsync(Order order);
        Task<bool> UpdateAsync(Order order);
        Task<bool> UpdateStatusAsync(int orderId, OrderStatus status);
    }
}

// MyCompany.MyApplication.Domain/Services/IAuthorizationService.cs
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyCompany.MyApplication.Domain.Services
{
    public interface IAuthorizationService
    {
        Task<bool> IsAuthorizedAsync(ClaimsPrincipal user, string permission);
        Task<IEnumerable<string>> GetUserRolesAsync(string username);
        Task<IEnumerable<string>> GetRolePermissionsAsync(string role);
        Task<bool> HasPermissionAsync(ClaimsPrincipal user, string permission);
    }
}

// MyCompany.MyApplication.Domain/Services/IProductService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Services
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllProductsAsync();
        Task<Product> GetProductByIdAsync(int id);
        Task<IEnumerable<Product>> GetProductsByCategoryAsync(string category);
        Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm);
        Task<bool> CreateProductAsync(Product product);
        Task<bool> UpdateProductAsync(Product product);
        Task<bool> DeleteProductAsync(int id);
    }
}

// MyCompany.MyApplication.Domain/Services/IOrderService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Services
{
    public interface IOrderService
    {
        Task<IEnumerable<Order>> GetAllOrdersAsync();
        Task<Order> GetOrderByIdAsync(int id);
        Task<IEnumerable<Order>> GetOrdersByCustomerAsync(int customerId);
        Task<bool> CreateOrderAsync(Order order);
        Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus status);
        Task<decimal> CalculateOrderTotalAsync(List<OrderItem> items);
    }
}


  // MyCompany.MyApplication.Common/Constants/ApplicationConstants.cs
namespace MyCompany.MyApplication.Common.Constants
{
    public static class ApplicationConstants
    {
        public static class Permissions
        {
            public const string Create = "Create";
            public const string Read = "Read";
            public const string Update = "Update";
            public const string Delete = "Delete";
            public const string Manage = "Manage";
        }

        public static class Roles
        {
            public const string Admin = "Admin";
            public const string Editor = "Editor";
            public const string Viewer = "Viewer";
        }

        public static class DatabaseSettings
        {
            public const int DefaultCommandTimeout = 30;
            public const int ConnectionPoolSize = 100;
        }

        public static class ErrorMessages
        {
            public const string UnauthorizedAccess = "You do not have permission to perform this action.";
            public const string ResourceNotFound = "The requested resource was not found.";
            public const string ValidationFailed = "Validation failed for the provided data.";
            public const string DatabaseError = "An error occurred while accessing the database.";
        }
    }
}

// MyCompany.MyApplication.Common/Extensions/StringExtensions.cs
using System;
using System.Text.RegularExpressions;

namespace MyCompany.MyApplication.Common.Extensions
{
    public static class StringExtensions
    {
        public static bool IsNullOrEmpty(this string value)
        {
            return string.IsNullOrEmpty(value);
        }

        public static bool IsNullOrWhiteSpace(this string value)
        {
            return string.IsNullOrWhiteSpace(value);
        }

        public static string ToSafeString(this string value)
        {
            return value ?? string.Empty;
        }

        public static bool IsValidEmail(this string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
                return emailRegex.IsMatch(email);
            }
            catch
            {
                return false;
            }
        }

        public static string TruncateWithEllipsis(this string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value) || value.Length <= maxLength)
                return value;

            return value.Substring(0, maxLength - 3) + "...";
        }
    }
}

// MyCompany.MyApplication.Common/Extensions/DateTimeExtensions.cs
using System;

namespace MyCompany.MyApplication.Common.Extensions
{
    public static class DateTimeExtensions
    {
        public static string ToFormattedString(this DateTime dateTime)
        {
            return dateTime.ToString("yyyy-MM-dd HH:mm:ss");
        }

        public static string ToDateOnlyString(this DateTime dateTime)
        {
            return dateTime.ToString("yyyy-MM-dd");
        }

        public static bool IsWeekend(this DateTime dateTime)
        {
            return dateTime.DayOfWeek == DayOfWeek.Saturday || dateTime.DayOfWeek == DayOfWeek.Sunday;
        }

        public static DateTime StartOfDay(this DateTime dateTime)
        {
            return new DateTime(dateTime.Year, dateTime.Month, dateTime.Day);
        }

        public static DateTime EndOfDay(this DateTime dateTime)
        {
            return new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 23, 59, 59, 999);
        }
    }
}

// MyCompany.MyApplication.Common/Exceptions/BusinessException.cs
using System;

namespace MyCompany.MyApplication.Common.Exceptions
{
    public class BusinessException : Exception
    {
        public string ErrorCode { get; }

        public BusinessException(string message) : base(message)
        {
            ErrorCode = "BUSINESS_ERROR";
        }

        public BusinessException(string message, string errorCode) : base(message)
        {
            ErrorCode = errorCode;
        }

        public BusinessException(string message, Exception innerException) : base(message, innerException)
        {
            ErrorCode = "BUSINESS_ERROR";
        }

        public BusinessException(string message, string errorCode, Exception innerException) : base(message, innerException)
        {
            ErrorCode = errorCode;
        }
    }

    public class ValidationException : BusinessException
    {
        public ValidationException(string message) : base(message, "VALIDATION_ERROR")
        {
        }

        public ValidationException(string message, Exception innerException) : base(message, "VALIDATION_ERROR", innerException)
        {
        }
    }

    public class NotFoundException : BusinessException
    {
        public NotFoundException(string message) : base(message, "NOT_FOUND")
        {
        }

        public NotFoundException(string resourceType, object identifier) 
            : base($"{resourceType} with identifier '{identifier}' was not found.", "NOT_FOUND")
        {
        }
    }

    public class UnauthorizedException : BusinessException
    {
        public UnauthorizedException(string message) : base(message, "UNAUTHORIZED")
        {
        }

        public UnauthorizedException() : base("You do not have permission to perform this action.", "UNAUTHORIZED")
        {
        }
    }
}

// MyCompany.MyApplication.Common/Helpers/SecurityHelper.cs
using System;
using System.Security.Cryptography;
using System.Text;

namespace MyCompany.MyApplication.Common.Helpers
{
    public static class SecurityHelper
    {
        public static string HashPassword(string password, string salt)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + salt));
            return Convert.ToBase64String(hashedBytes);
        }

        public static string GenerateSalt()
        {
            var saltBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(saltBytes);
            return Convert.ToBase64String(saltBytes);
        }

        public static bool VerifyPassword(string password, string hash, string salt)
        {
            var hashToVerify = HashPassword(password, salt);
            return hashToVerify == hash;
        }

        public static string GenerateRandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            var result = new StringBuilder(length);
            
            for (int i = 0; i < length; i++)
            {
                result.Append(chars[random.Next(chars.Length)]);
            }
            
            return result.ToString();
        }
    }
}

// MyCompany.MyApplication.Common/Models/ApiResponse.cs
using System;

namespace MyCompany.MyApplication.Common.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; } = string.Empty;
        public string ErrorCode { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public static ApiResponse<T> SuccessResult(T data, string message = "")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Data = data,
                Message = message
            };
        }

        public static ApiResponse<T> ErrorResult(string message, string errorCode = "")
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                ErrorCode = errorCode
            };
        }
    }

    public class ApiResponse : ApiResponse<object>
    {
        public static ApiResponse Success(string message = "")
        {
            return new ApiResponse
            {
                Success = true,
                Message = message
            };
        }

        public static ApiResponse Error(string message, string errorCode = "")
        {
            return new ApiResponse
            {
                Success = false,
                Message = message,
                ErrorCode = errorCode
            };
        }
    }
}

// MyCompany.MyApplication.Common/Models/PaginatedResult.cs
using System;
using System.Collections.Generic;

namespace MyCompany.MyApplication.Common.Models
{
    public class PaginatedResult<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;

        public PaginatedResult()
        {
        }

        public PaginatedResult(IEnumerable<T> data, int totalCount, int pageNumber, int pageSize)
        {
            Data = data;
            TotalCount = totalCount;
            PageNumber = pageNumber;
            PageSize = pageSize;
        }
    }

    public class PaginationRequest
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = string.Empty;
        public string SortDirection { get; set; } = "asc";
        public string SearchTerm { get; set; } = string.Empty;
    }
}

  // MyCompany.MyApplication.Infrastructure/Data/ConnectionFactories/ISqlConnectionFactory.cs
using System.Data;

namespace MyCompany.MyApplication.Infrastructure.Data.ConnectionFactories
{
    public interface ISqlConnectionFactory
    {
        IDbConnection CreateConnection();
        int CommandTimeout { get; }
    }
}

// MyCompany.MyApplication.Infrastructure/Data/ConnectionFactories/IOracleConnectionFactory.cs
using System.Data;

namespace MyCompany.MyApplication.Infrastructure.Data.ConnectionFactories
{
    public interface IOracleConnectionFactory
    {
        IDbConnection CreateConnection();
        int CommandTimeout { get; }
    }
}

// MyCompany.MyApplication.Infrastructure/Data/ConnectionFactories/SqlConnectionFactory.cs
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace MyCompany.MyApplication.Infrastructure.Data.ConnectionFactories
{
    public class SqlConnectionFactory : ISqlConnectionFactory
    {
        private readonly string _connectionString;
        private readonly int _commandTimeout;

        public SqlConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("SqlServerConnection") 
                ?? throw new ArgumentNullException(nameof(configuration), "SQL Server connection string is required");
            _commandTimeout = configuration.GetSection("DatabaseOptions:CommandTimeout").Get<int>();
        }

        public IDbConnection CreateConnection()
        {
            var connection = new SqlConnection(_connectionString);
            connection.Open();
            return connection;
        }

        public int CommandTimeout => _commandTimeout;
    }
}

// MyCompany.MyApplication.Infrastructure/Data/ConnectionFactories/OracleConnectionFactory.cs
using System.Data;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;

namespace MyCompany.MyApplication.Infrastructure.Data.ConnectionFactories
{
    public class OracleConnectionFactory : IOracleConnectionFactory
    {
        private readonly string _connectionString;
        private readonly int _commandTimeout;

        public OracleConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection")
                ?? throw new ArgumentNullException(nameof(configuration), "Oracle connection string is required");
            _commandTimeout = configuration.GetSection("DatabaseOptions:CommandTimeout").Get<int>();
        }

        public IDbConnection CreateConnection()
        {
            var connection = new OracleConnection(_connectionString);
            connection.Open();
            return connection;
        }

        public int CommandTimeout => _commandTimeout;
    }
}

// MyCompany.MyApplication.Infrastructure/Repositories/SqlServer/UserRepository.cs
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using MyCompany.MyApplication.Domain.Models;
using MyCompany.MyApplication.Domain.Repositories;
using MyCompany.MyApplication.Infrastructure.Data.ConnectionFactories;
using MyCompany.MyApplication.Common.Exceptions;

namespace MyCompany.MyApplication.Infrastructure.Repositories.SqlServer
{
    public class UserRepository : IUserRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;
        private readonly ILogger<UserRepository> _logger;

        public UserRepository(ISqlConnectionFactory connectionFactory, ILogger<UserRepository> logger)
        {
            _connectionFactory = connectionFactory;
            _logger = logger;
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                
                var user = await connection.QueryFirstOrDefaultAsync<User>(
                    @"SELECT Id, Username, Email, FullName, IsActive, CreatedAt, LastLogin 
                    FROM Users 
                    WHERE Username = @Username AND IsActive = 1",
                    new { Username = username },
                    commandTimeout: _connectionFactory.CommandTimeout);

                if (user != null)
                {
                    user.Roles = await GetUserRolesAsync(connection, user.Id);
                }

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by username: {Username}", username);
                throw;
            }
        }

        public async Task<User> GetByIdAsync(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                
                var user = await connection.QueryFirstOrDefaultAsync<User>(
                    @"SELECT Id, Username, Email, FullName, IsActive, CreatedAt, LastLogin 
                    FROM Users 
                    WHERE Id = @Id",
                    new { Id = id },
                    commandTimeout: _connectionFactory.CommandTimeout);

                if (user != null)
                {
                    user.Roles = await GetUserRolesAsync(connection, user.Id);
                }

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by ID: {UserId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                
                var users = await connection.QueryAsync<User>(
                    @"SELECT Id, Username, Email, FullName, IsActive, CreatedAt, LastLogin 
                    FROM Users 
                    ORDER BY FullName",
                    commandTimeout: _connectionFactory.CommandTimeout);

                // Load roles for each user
                foreach (var user in users)
                {
                    user.Roles = await GetUserRolesAsync(connection, user.Id);
                }

                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all users");
                throw;
            }
        }

        public async Task<IEnumerable<Role>> GetAllRolesAsync()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                
                var roles = await connection.QueryAsync<Role>(
                    @"SELECT Id, Name, Description FROM Roles ORDER BY Name",
                    commandTimeout: _connectionFactory.CommandTimeout);

                return roles;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all roles");
                throw;
            }
        }

        public async Task<bool> CreateUserAsync(User user)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                using var transaction = connection.BeginTransaction();

                try
                {
                    var sql = @"INSERT INTO Users (Username, Email, FullName, IsActive, CreatedAt) 
                              VALUES (@Username, @Email, @FullName, @IsActive, @CreatedAt);
                              SELECT CAST(SCOPE_IDENTITY() as int);";

                    var userId = await connection.QuerySingleAsync<int>(sql, user, transaction, _connectionFactory.CommandTimeout);
                    user.Id = userId;

                    transaction.Commit();
                    return true;
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user: {Username}", user.Username);
                return false;
            }
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                
                var sql = @"UPDATE Users SET 
                          Email = @Email, 
                          FullName = @FullName, 
                          IsActive = @IsActive,
                          LastLogin = @LastLogin
                          WHERE Id = @Id";

                var rowsAffected = await connection.ExecuteAsync(sql, user, commandTimeout: _connectionFactory.CommandTimeout);
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user: {UserId}", user.Id);
                return false;
            }
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                
                var sql = @"UPDATE Users SET IsActive = 0 WHERE Id = @Id";
                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id }, commandTimeout: _connectionFactory.CommandTimeout);
                
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user: {UserId}", id);
                return false;
            }
        }

        public async Task<bool> AssignRoleToUserAsync(int userId, int roleId, string assignedBy)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                
                var sql = @"INSERT INTO UserRoles (UserId, RoleId, AssignedAt, AssignedBy) 
                          VALUES (@UserId, @RoleId, @AssignedAt, @AssignedBy)";

                var rowsAffected = await connection.ExecuteAsync(sql, 
                    new { UserId = userId, RoleId = roleId, AssignedAt = DateTime.UtcNow, AssignedBy = assignedBy }, 
                    commandTimeout: _connectionFactory.CommandTimeout);
                
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role {RoleId} to user {UserId}", roleId, userId);
                return false;
            }
        }

        public async Task<bool> RemoveRoleFromUserAsync(int userId, int roleId)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                
                var sql = @"DELETE FROM UserRoles WHERE UserId = @UserId AND RoleId = @RoleId";
                var rowsAffected = await connection.ExecuteAsync(sql, 
                    new { UserId = userId, RoleId = roleId }, 
                    commandTimeout: _connectionFactory.CommandTimeout);
                
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing role {RoleId} from user {UserId}", roleId, userId);
                return false;
            }
        }

        private async Task<List<UserRole>> GetUserRolesAsync(IDbConnection connection, int userId)
        {
            var roles = await connection.QueryAsync<UserRole>(
                @"SELECT ur.Id, ur.UserId, ur.RoleId, r.Name as RoleName, ur.AssignedAt, ur.AssignedBy
                FROM UserRoles ur
                JOIN Roles r ON ur.RoleId = r.Id
                WHERE ur.UserId = @UserId",
                new { UserId = userId },
                commandTimeout: _connectionFactory.CommandTimeout);

            return roles.ToList();
        }
    }
}

// MyCompany.MyApplication.Infrastructure/Repositories/Oracle/ProductRepository.cs
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using MyCompany.MyApplication.Domain.Models;
using MyCompany.MyApplication.Domain.Repositories;
using MyCompany.MyApplication.Infrastructure.Data.ConnectionFactories;

namespace MyCompany.MyApplication.Infrastructure.Repositories.Oracle
{
    public class ProductRepository : IProductRepository
    {
        private readonly IOracleConnectionFactory _connectionFactory;
        private readonly ILogger<ProductRepository> _logger;

        public ProductRepository(IOracleConnectionFactory connectionFactory, ILogger<ProductRepository> logger)
        {
            _connectionFactory = connectionFactory;
            _logger = logger;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                
                var products = await connection.QueryAsync<Product>(
                    @"SELECT ID as Id, NAME as Name, DESCRIPTION as Description, 
                    PRICE as Price, STOCK as Stock, CATEGORY as Category, 
                    IS_ACTIVE as IsActive, CREATED_AT as CreatedAt, UPDATED_AT as UpdatedAt
                    FROM PRODUCTS 
                    WHERE IS_ACTIVE = 1
                    ORDER BY NAME",
                    commandTimeout: _connectionFactory.CommandTimeout);

                return products;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all products");
                throw;
            }
        }

        public async Task<Product> GetByIdAsync(int id)
        {
            try



    // ========== CORE LAYER - BUSINESS LOGIC ==========
// MyCompany.MyApplication.Core/Services/AuthorizationService.cs
using System;
using System.Collections.Generic;
using System.DirectoryServices.AccountManagement;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MyCompany.MyApplication.Domain.Models;
using MyCompany.MyApplication.Domain.Repositories;
using MyCompany.MyApplication.Domain.Services;

namespace MyCompany.MyApplication.Core.Services
{
    public class AuthorizationService : IAuthorizationService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthorizationService> _logger;

        public AuthorizationService(
            IUserRepository userRepository,
            IConfiguration configuration,
            ILogger<AuthorizationService> logger)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> IsAuthorizedAsync(ClaimsPrincipal user, string permission)
        {
            return await IsAuthorizedAsync(user, permission, null);
        }

        public async Task<bool> IsAuthorizedAsync(ClaimsPrincipal user, string permission, string resource)
        {
            try
            {
                if (user == null || !user.Identity.IsAuthenticated)
                {
                    _logger.LogWarning("Authorization failed: User is not authenticated");
                    return false;
                }

                var username = user.Identity.Name;
                _logger.LogDebug("Checking authorization for user {Username}, permission {Permission}, resource {Resource}", 
                    username, permission, resource);

                // Get user roles (both from Windows groups and database)
                var userRoles = await GetUserRolesAsync(username);

                if (!userRoles.Any())
                {
                    _logger.LogWarning("User {Username} has no roles assigned", username);
                    return false;
                }

                // Check each role for the required permission
                foreach (var role in userRoles)
                {
                    var permissions = await GetRolePermissionsAsync(role);
                    if (permissions.Contains(permission, StringComparer.OrdinalIgnoreCase))
                    {
                        // If resource-specific check is needed
                        if (!string.IsNullOrEmpty(resource))
                        {
                            return await CheckResourcePermissionAsync(user, role, resource);
                        }
                        
                        return true;
                    }
                }

                _logger.LogInformation("User {Username} denied access to permission {Permission}", username, permission);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking authorization for user {Username}", user?.Identity?.Name);
                return false;
            }
        }

        public async Task<IEnumerable<string>> GetUserRolesAsync(string username)
        {
            try
            {
                var allRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                // 1. Get roles from Windows groups
                var windowsRoles = GetWindowsGroupRoles(username);
                foreach (var role in windowsRoles)
                {
                    allRoles.Add(role);
                }

                // 2. Get roles from database
                var dbUser = await _userRepository.GetByUsernameAsync(username);
                if (dbUser != null)
                {
                    var activeRoles = dbUser.Roles.Where(r => r.IsActive).Select(r => r.RoleName);
                    foreach (var role in activeRoles)
                    {
                        allRoles.Add(role);
                    }

                    // Update last login
                    await _userRepository.UpdateLastLoginAsync(dbUser.Id, DateTime.UtcNow);
                }

                return allRoles;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting roles for user {Username}", username);
                return Enumerable.Empty<string>();
            }
        }

        public Task<IEnumerable<string>> GetRolePermissionsAsync(string role)
        {
            try
            {
                var permissions = _configuration.GetSection($"Authorization:Roles:{role}:Permissions")
                    .Get<List<string>>();
                
                return Task.FromResult<IEnumerable<string>>(permissions ?? Enumerable.Empty<string>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions for role {Role}", role);
                return Task.FromResult<IEnumerable<string>>(Enumerable.Empty<string>());
            }
        }

        public async Task<bool> HasRoleAsync(ClaimsPrincipal user, string role)
        {
            var userRoles = await GetUserRolesAsync(user.Identity.Name);
            return userRoles.Contains(role, StringComparer.OrdinalIgnoreCase);
        }

        public async Task<bool> CanAccessDepartmentDataAsync(ClaimsPrincipal user, string department)
        {
            try
            {
                // Admins can access all departments
                if (await HasRoleAsync(user, "Admin"))
                    return true;

                // Check if user belongs to the same department
                var dbUser = await _userRepository.GetByUsernameAsync(user.Identity.Name);
                if (dbUser != null && dbUser.Department.Equals(department, StringComparison.OrdinalIgnoreCase))
                    return true;

                // Check if user has cross-department access permission
                return await IsAuthorizedAsync(user, "AccessAllDepartments");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking department access for user {Username}", user.Identity.Name);
                return false;
            }
        }

        private IEnumerable<string> GetWindowsGroupRoles(string username)
        {
            try
            {
                var roleMapping = _configuration.GetSection("Authorization:RoleMapping")
                    .GetChildren()
                    .ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);

                var roles = new List<string>();

                using (var context = new PrincipalContext(ContextType.Domain))
                {
                    var userPrincipal = UserPrincipal.FindByIdentity(context, username);
                    if (userPrincipal != null)
                    {
                        var groups = userPrincipal.GetAuthorizationGroups();
                        foreach (var group in groups)
                        {
                            var groupName = $"{group.Context.Name}\\{group.Name}";
                            if (roleMapping.TryGetValue(groupName, out string mappedRole))
                            {
                                roles.Add(mappedRole);
                            }
                        }
                    }
                }

                return roles.Distinct();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Windows group roles for user {Username}", username);
                return Enumerable.Empty<string>();
            }
        }

        private async Task<bool> CheckResourcePermissionAsync(ClaimsPrincipal user, string role, string resource)
        {
            // Implement resource-specific permission logic here
            // For example, checking if user can access specific department data
            if (resource.StartsWith("Department:", StringComparison.OrdinalIgnoreCase))
            {
                var department = resource.Substring("Department:".Length);
                return await CanAccessDepartmentDataAsync(user, department);
            }

            return true; // Default allow if no specific resource check is implemented
        }
    }
}

// MyCompany.MyApplication.Core/Services/ProductService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyCompany.MyApplication.Domain.Models;
using MyCompany.MyApplication.Domain.Repositories;
using MyCompany.MyApplication.Domain.Services;

namespace MyCompany.MyApplication.Core.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ILogger<ProductService> _logger;

        public ProductService(
            IProductRepository productRepository,
            ILogger<ProductService> logger)
        {
            _productRepository = productRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving all products");
                return await _productRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all products");
                throw;
            }
        }

        public async Task<IEnumerable<Product>> GetActiveProductsAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving active products");
                return await _productRepository.GetActiveProductsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active products");
                throw;
            }
        }

        public async Task<Product> GetProductByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Retrieving product {ProductId}", id);
                
                if (id <= 0)
                {
                    throw new ArgumentException("Product ID must be greater than zero", nameof(id));
                }

                return await _productRepository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product {ProductId}", id);
                throw;
            }
        }

        public async Task<Product> GetProductByCodeAsync(string productCode)
        {
            try
            {
                _logger.LogInformation("Retrieving product by code {ProductCode}", productCode);
                
                if (string.IsNullOrWhiteSpace(productCode))
                {
                    throw new ArgumentException("Product code cannot be empty", nameof(productCode));
                }

                return await _productRepository.GetByCodeAsync(productCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product by code {ProductCode}", productCode);
                throw;
            }
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            try
            {
                _logger.LogInformation("Retrieving products for category {CategoryId}", categoryId);
                return await _productRepository.GetByCategoryAsync(categoryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for category {CategoryId}", categoryId);
                throw;
            }
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm)
        {
            try
            {
                _logger.LogInformation("Searching products with term: {SearchTerm}", searchTerm);
                
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return await GetActiveProductsAsync();
                }

                return await _productRepository.SearchAsync(searchTerm);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching products with term {SearchTerm}", searchTerm);
                throw;
            }
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving low stock products");
                return await _productRepository.GetLowStockProductsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving low stock products");
                throw;
            }
        }

        public async Task<Product> CreateProductAsync(Product product, string createdBy)
        {
            try
            {
                _logger.LogInformation("Creating new product {ProductName} by {User}", product.Name, createdBy);
                
                // Business validation
                await ValidateProductAsync(product);
                
                // Check if product code already exists
                var existingProduct = await _productRepository.GetByCodeAsync(product.ProductCode);
                if (existingProduct != null)
                {
                    throw new InvalidOperationException($"Product with code '{product.ProductCode}' already exists");
                }

                // Set audit fields
                product.CreatedAt = DateTime.UtcNow;
                product.CreatedBy = createdBy;
                product.IsActive = true;

                var productId = await _productRepository.CreateAsync(product);
                product.Id = productId;

                _logger.LogInformation("Successfully created product {ProductId}", productId);
                return product;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product {ProductName}", product?.Name);
                throw;
            }
        }

        public async Task<Product> UpdateProductAsync(Product product, string updatedBy)
        {
            try
            {
                _logger.LogInformation("Updating product {ProductId} by {User}", product.Id, updatedBy);
                
                // Business validation
                await ValidateProductAsync(product);
                
                // Check if product exists
                var existingProduct = await _productRepository.GetByIdAsync(product.Id);
                if (existingProduct == null)
                {
                    throw new InvalidOperationException($"Product with ID {product.Id} not found");
                }

                // Check if product code is being changed and if new code already exists
                if (!existingProduct.ProductCode.Equals(product.ProductCode, StringComparison.OrdinalIgnoreCase))
                {
                    var duplicateProduct = await _productRepository.GetByCodeAsync(product.ProductCode);
                    if (duplicateProduct != null && duplicateProduct.Id != product.Id)
                    {
                        throw new InvalidOperationException($"Product with code '{product.ProductCode}' already exists");
                    }
                }

                // Set audit fields
                product.UpdatedAt = DateTime.UtcNow;
                product.UpdatedBy = updatedBy;

                await _productRepository.UpdateAsync(product);

                _logger.LogInformation("Successfully updated product {ProductId}", product.Id);
                return product;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product {ProductId}", product?.Id);
                throw;
            }
        }

        public async Task<bool> UpdateProductStockAsync(int productId, int quantity, string updatedBy)
        {
            try
            {
                _logger.LogInformation("Updating stock for product {ProductId} by {Quantity} units", productId, quantity);
                
                var product = await _productRepository.GetByIdAsync(productId);
                if (product == null)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found");
                }

                if (product.Stock + quantity < 0)
                {
                    throw new InvalidOperationException("Cannot reduce stock below zero");
                }

                var result = await _productRepository.UpdateStockAsync(productId, product.Stock + quantity, updatedBy);
                
                if (result)
                {
                    _logger.LogInformation("Successfully updated stock for product {ProductId}", productId);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock for product {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> DeactivateProductAsync(int productId, string updatedBy)
        {
            try
            {
                _logger.LogInformation("Deactivating product {ProductId} by {User}", productId, updatedBy);
                
                var product = await _productRepository.GetByIdAsync(productId);
                if (product == null)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found");
                }

                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;
                product.UpdatedBy = updatedBy;

                var result = await _productRepository.UpdateAsync(product);
                
                if (result)
                {
                    _logger.LogInformation("Successfully deactivated product {ProductId}", productId);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating product {ProductId}", productId);
                throw;
            }
        }

        public async Task<IEnumerable<Category>> GetCategoriesAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving all categories");
                return await _productRepository.GetCategoriesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                throw;
            }
        }

        private async Task ValidateProductAsync(Product product)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(product.Name))
                errors.Add("Product name is required");

            if (string.IsNullOrWhiteSpace(product.ProductCode))
                errors.Add("Product code is required");

            if (product.Price <= 0)
                errors.Add("Product price must be greater than zero");

            if (product.Stock < 0)
                errors.Add("Product stock cannot be negative");

            if (product.CategoryId <= 0  



  // ========== DOMAIN LAYER ==========
// MyCompany.MyApplication.Domain/Models/User.cs
using System;
using System.Collections.Generic;

namespace MyCompany.MyApplication.Domain.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Department { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public List<UserRole> Roles { get; set; } = new List<UserRole>();
        
        // Domain methods
        public bool HasRole(string roleName)
        {
            return Roles.Any(r => r.RoleName.Equals(roleName, StringComparison.OrdinalIgnoreCase));
        }
        
        public bool IsInDepartment(string department)
        {
            return Department?.Equals(department, StringComparison.OrdinalIgnoreCase) == true;
        }
    }

    public class UserRole
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public DateTime AssignedAt { get; set; }
        public string AssignedBy { get; set; }
        public DateTime? ExpiresAt { get; set; }
        
        public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
        public bool IsActive => !IsExpired;
    }

    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; } // Higher number = higher priority
        public bool IsSystemRole { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
    }
}

// MyCompany.MyApplication.Domain/Models/Product.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace MyCompany.MyApplication.Domain.Models
{
    public class Product
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [StringLength(500)]
        public string Description { get; set; }
        
        [Required]
        public string ProductCode { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Range(0, int.MaxValue)]
        public int Stock { get; set; }
        
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        
        // Domain methods
        public bool IsInStock => Stock > 0;
        public bool IsDiscontinued => !IsActive;
        
        public decimal CalculateDiscountedPrice(decimal discountPercentage)
        {
            if (discountPercentage < 0 || discountPercentage > 100)
                throw new ArgumentException("Discount percentage must be between 0 and 100");
                
            return Price * (1 - discountPercentage / 100);
        }
        
        public void UpdateStock(int quantity, string updatedBy)
        {
            if (Stock + quantity < 0)
                throw new InvalidOperationException("Insufficient stock");
                
            Stock += quantity;
            UpdatedAt = DateTime.UtcNow;
            UpdatedBy = updatedBy;
        }
    }
}

// MyCompany.MyApplication.Domain/Models/Category.cs
namespace MyCompany.MyApplication.Domain.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int? ParentCategoryId { get; set; }
        public string ParentCategoryName { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
    }
}

// MyCompany.MyApplication.Domain/Models/Order.cs (From Oracle DB)
using System;
using System.Collections.Generic;
using System.Linq;

namespace MyCompany.MyApplication.Domain.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? ShippedDate { get; set; }
        public OrderStatus Status { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; }
        public string BillingAddress { get; set; }
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
        
        // Domain methods
        public void CalculateTotals()
        {
            SubTotal = Items.Sum(i => i.TotalPrice);
            TotalAmount = SubTotal + TaxAmount + ShippingAmount;
        }
        
        public bool CanBeCancelled => Status == OrderStatus.Pending || Status == OrderStatus.Processing;
        public bool IsShipped => ShippedDate.HasValue;
        public int TotalItems => Items.Sum(i => i.Quantity);
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        
        public void CalculateTotal()
        {
            TotalPrice = Quantity * UnitPrice;
        }
    }

    public enum OrderStatus
    {
        Pending = 1,
        Processing = 2,
        Shipped = 3,
        Delivered = 4,
        Cancelled = 5,
        Returned = 6
    }
}

// ========== DOMAIN INTERFACES ==========
// MyCompany.MyApplication.Domain/Repositories/IUserRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(int id);
        Task<User> GetByUsernameAsync(string username);
        Task<User> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetAllAsync();
        Task<IEnumerable<User>> GetByDepartmentAsync(string department);
        Task<IEnumerable<User>> GetActiveUsersAsync();
        Task<int> CreateAsync(User user);
        Task<bool> UpdateAsync(User user);
        Task<bool> DeleteAsync(int id);
        Task<bool> DeactivateAsync(int id);
        Task<IEnumerable<Role>> GetAllRolesAsync();
        Task<IEnumerable<UserRole>> GetUserRolesAsync(int userId);
        Task<bool> AssignRoleAsync(int userId, int roleId, string assignedBy);
        Task<bool> RemoveRoleAsync(int userId, int roleId);
        Task UpdateLastLoginAsync(int userId, DateTime lastLogin);
    }
}

// MyCompany.MyApplication.Domain/Repositories/IProductRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync();
        Task<IEnumerable<Product>> GetActiveProductsAsync();
        Task<Product> GetByIdAsync(int id);
        Task<Product> GetByCodeAsync(string productCode);
        Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<Product>> SearchAsync(string searchTerm);
        Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10);
        Task<int> CreateAsync(Product product);
        Task<bool> UpdateAsync(Product product);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateStockAsync(int productId, int newStock, string updatedBy);
        Task<IEnumerable<Category>> GetCategoriesAsync();
    }
}

// MyCompany.MyApplication.Domain/Repositories/IOrderRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Repositories
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Order>> GetAllAsync();
        Task<Order> GetByIdAsync(int id);
        Task<Order> GetByOrderNumberAsync(string orderNumber);
        Task<IEnumerable<Order>> GetByCustomerAsync(int customerId);
        Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status);
        Task<IEnumerable<Order>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<int> CreateAsync(Order order);
        Task<bool> UpdateAsync(Order order);
        Task<bool> UpdateStatusAsync(int orderId, OrderStatus status);
        Task<bool> DeleteAsync(int id);
        Task<decimal> GetTotalSalesAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Order>> GetRecentOrdersAsync(int count = 50);
    }
}

// MyCompany.MyApplication.Domain/Services/IAuthorizationService.cs
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyCompany.MyApplication.Domain.Services
{
    public interface IAuthorizationService
    {
        Task<bool> IsAuthorizedAsync(ClaimsPrincipal user, string permission);
        Task<bool> IsAuthorizedAsync(ClaimsPrincipal user, string permission, string resource);
        Task<IEnumerable<string>> GetUserRolesAsync(string username);
        Task<IEnumerable<string>> GetRolePermissionsAsync(string role);
        Task<bool> HasRoleAsync(ClaimsPrincipal user, string role);
        Task<bool> CanAccessDepartmentDataAsync(ClaimsPrincipal user, string department);
    }
}

// MyCompany.MyApplication.Domain/Services/IProductService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Services
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllProductsAsync();
        Task<IEnumerable<Product>> GetActiveProductsAsync();
        Task<Product> GetProductByIdAsync(int id);
        Task<Product> GetProductByCodeAsync(string productCode);
        Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId);
        Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm);
        Task<IEnumerable<Product>> GetLowStockProductsAsync();
        Task<Product> CreateProductAsync(Product product, string createdBy);
        Task<Product> UpdateProductAsync(Product product, string updatedBy);
        Task<bool> UpdateProductStockAsync(int productId, int quantity, string updatedBy);
        Task<bool> DeactivateProductAsync(int productId, string updatedBy);
        Task<IEnumerable<Category>> GetCategoriesAsync();
    }
}

// MyCompany.MyApplication.Domain/Services/IOrderService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyCompany.MyApplication.Domain.Models;

namespace MyCompany.MyApplication.Domain.Services
{
    public interface IOrderService
    {
        Task<IEnumerable<Order>> GetAllOrdersAsync();
        Task<Order> GetOrderByIdAsync(int id);
        Task<Order> GetOrderByNumberAsync(string orderNumber);
        Task<IEnumerable<Order>> GetCustomerOrdersAsync(int customerId);
        Task<IEnumerable<Order>> GetOrdersByStatusAsync(OrderStatus status);
        Task<Order> CreateOrderAsync(Order order);
        Task<Order> UpdateOrderAsync(Order order);
        Task<bool> CancelOrderAsync(int orderId);
        Task<bool> ShipOrderAsync(int orderId, DateTime shippedDate);
        Task<decimal> GetSalesReportAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Order>> GetRecentOrdersAsync(int count = 50);
    }
}
