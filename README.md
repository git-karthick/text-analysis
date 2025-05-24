To retrieve **account details with signers** using **Dapper** (a lightweight ORM for ADO.NET) in a .NET 8 Web API, follow these steps. This approach focuses on raw SQL queries and manual mapping while maintaining separation of concerns.

---

### **1. Domain Models & DTOs (Core Layer)**
Define the same domain models and DTOs as before:
```csharp
// Core/Domain/Account.cs
public class Account
{
    public int Id { get; set; }
    public string AccountNumber { get; set; }
    public string AccountType { get; set; }
    public List<Signer> Signers { get; set; } = new();
}

// Core/Domain/Signer.cs
public class Signer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public int AccountId { get; set; }
}

// Core/DTOs/AccountDetailsDto.cs
public class AccountDetailsDto
{
    public int Id { get; set; }
    public string AccountNumber { get; set; }
    public string AccountType { get; set; }
    public List<SignerDto> Signers { get; set; }
}

// Core/DTOs/SignerDto.cs
public class SignerDto
{
    public string Name { get; set; }
    public string Email { get; set; }
}
```

---

### **2. Repository Interfaces (Core Layer)**
Define the repository contract:
```csharp
// Core/Interfaces/IAccountRepository.cs
public interface IAccountRepository
{
    Task<Account> GetAccountWithSignersAsync(int accountId);
}
```

---

### **3. Repository Implementation with Dapper (Infrastructure Layer)**
Use Dapper to execute SQL and map results:
```csharp
// Infrastructure/Repositories/AccountRepository.cs
public class AccountRepository : IAccountRepository
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public AccountRepository(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<Account> GetAccountWithSignersAsync(int accountId)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        
        // Query Account and Signers in one SQL call
        var query = @"
            SELECT a.*, s.* 
            FROM Accounts a 
            LEFT JOIN Signers s ON a.Id = s.AccountId 
            WHERE a.Id = @AccountId";

        var result = await connection.QueryAsync<Account, Signer, Account>(
            sql: query,
            map: (account, signer) => 
            {
                // Group signers under the account
                account.Signers.Add(signer);
                return account;
            },
            param: new { AccountId = accountId },
            splitOn: "Id" // Split columns after Account.Id to map Signer
        );

        // Aggregate results (Dapper returns one row per signer)
        return result
            .GroupBy(a => a.Id)
            .Select(g =>
            {
                var account = g.First();
                account.Signers = g.Select(a => a.Signers.SingleOrDefault()).ToList();
                return account;
            })
            .FirstOrDefault(); // Return null if no account found
    }
}
```

---

### **4. Database Connection Factory**
Create a helper to manage connections (e.g., SQL Server):
```csharp
// Infrastructure/Data/DbConnectionFactory.cs
public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

public class SqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public SqlConnectionFactory(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("Default");
    }

    public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
}
```

---

### **5. AutoMapper Configuration (Core Layer)**
Map domain models to DTOs:
```csharp
// Core/Mapping/AccountProfile.cs
public class AccountProfile : Profile
{
    public AccountProfile()
    {
        CreateMap<Account, AccountDetailsDto>();
        CreateMap<Signer, SignerDto>();
    }
}
```

---

### **6. Application Service (Core Layer)**
Reuse the same service as before:
```csharp
// Core/Services/AccountService.cs
public class AccountService(IAccountRepository accountRepo, IMapper mapper)
{
    public async Task<AccountDetailsDto> GetAccountDetailsAsync(int accountId)
    {
        var account = await accountRepo.GetAccountWithSignersAsync(accountId);
        if (account == null)
            throw new AccountNotFoundException(accountId);

        return mapper.Map<AccountDetailsDto>(account);
    }
}
```

---

### **7. API Controller (Presentation Layer)**
Expose the endpoint:
```csharp
[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly AccountService _accountService;

    public AccountsController(AccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AccountDetailsDto>> GetAccountDetails(int id)
    {
        var accountDetails = await _accountService.GetAccountDetailsAsync(id);
        return Ok(accountDetails);
    }
}
```

---

### **8. Dependency Injection Setup**
Register dependencies in `Program.cs`:
```csharp
// Register Dapper dependencies
builder.Services.AddScoped<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(AccountProfile).Assembly);
```

---

### **Key Differences from EF Core Approach**
1. **Manual SQL Handling**: Explicit SQL joins replace EF Core’s `Include()`.
2. **Result Aggregation**: Dapper returns one row per signer, so results must be grouped into a single `Account` object.
3. **Connection Management**: Use `IDbConnectionFactory` to create and dispose connections safely.

---

### **Testing the Endpoint**
**Request**:
```http
GET /api/accounts/1
```

**Response**:
```json
{
  "id": 1,
  "accountNumber": "ACC-12345",
  "accountType": "Savings",
  "signers": [
    { "name": "John Doe", "email": "john@example.com" },
    { "name": "Jane Smith", "email": "jane@example.com" }
  ]
}
```

---

### **Performance Considerations**
- **Single Query**: Fetching data in one SQL query avoids the N+1 problem.
- **Parameterization**: Dapper automatically parameterizes inputs to prevent SQL injection.
- **Async/Await**: Use asynchronous database operations to avoid blocking threads.

This approach maintains clean separation of layers while leveraging Dapper’s efficiency for raw SQL execution.