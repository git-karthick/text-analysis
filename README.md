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


To handle an **account opening API with 4 tabs** (each with its own table) and a shared `AccountId`, follow this structured approach using **.NET 8**, **Dapper**, and a clean architecture. This ensures separation of concerns while maintaining a common `AccountId` across all tabs.

---

### **Scenario Overview**
Assume the 4 tabs are:
1. **Basic Account Info** (e.g., account type, currency)
2. **Account Signers** (authorized users)
3. **Documents** (uploaded KYC/docs)
4. **Preferences** (notification settings, etc.)

All tabs share a common `AccountId` generated when the account is first created.

---

### **Step 1: Domain Models (Core Layer)**
Define models for each tab, all referencing `AccountId`:

```csharp
// Core/Domain/Account.cs
public class Account
{
    public int AccountId { get; set; } // Common across all tabs
    public string AccountType { get; set; }
    public string Currency { get; set; }
}

// Core/Domain/Signer.cs
public class Signer
{
    public int SignerId { get; set; }
    public int AccountId { get; set; } // Foreign key
    public string Name { get; set; }
    public string Email { get; set; }
}

// Core/Domain/Document.cs
public class Document
{
    public int DocumentId { get; set; }
    public int AccountId { get; set; }
    public string FilePath { get; set; }
    public string Type { get; set; }
}

// Core/Domain/Preference.cs
public class Preference
{
    public int PreferenceId { get; set; }
    public int AccountId { get; set; }
    public bool ReceiveNotifications { get; set; }
}
```

---

### **Step 2: DTOs (Data Transfer Objects)**
Define request/response DTOs for each tab:

```csharp
// Core/DTOs/AccountDto.cs
public class AccountDto
{
    public string AccountType { get; set; }
    public string Currency { get; set; }
}

// Core/DTOs/SignerDto.cs
public class SignerDto
{
    public string Name { get; set; }
    public string Email { get; set; }
}

// Core/DTOs/DocumentDto.cs
public class DocumentDto
{
    public IFormFile File { get; set; } // For uploads
    public string Type { get; set; }
}

// Core/DTOs/PreferenceDto.cs
public class PreferenceDto
{
    public bool ReceiveNotifications { get; set; }
}
```

---

### **Step 3: Repository Interfaces (Core Layer)**
Define contracts for CRUD operations on each tab:

```csharp
// Core/Interfaces/IAccountRepository.cs
public interface IAccountRepository
{
    Task<int> CreateAccountAsync(Account account); // Returns generated AccountId
    Task UpdateAccountAsync(Account account);
    Task<Account> GetAccountAsync(int accountId);
}

// Core/Interfaces/ISignerRepository.cs
public interface ISignerRepository
{
    Task AddSignerAsync(Signer signer);
    Task UpdateSignerAsync(Signer signer);
    Task DeleteSignerAsync(int signerId);
    Task<List<Signer>> GetSignersByAccountIdAsync(int accountId);
}

// Repeat for IDocumentRepository and IPreferenceRepository...
```

---

### **Step 4: Repository Implementations (Infrastructure Layer with Dapper)**
Implement repositories using Dapper and SQL:

```csharp
// Infrastructure/Repositories/AccountRepository.cs
public class AccountRepository : IAccountRepository
{
    private readonly IDbConnectionFactory _dbFactory;

    public AccountRepository(IDbConnectionFactory dbFactory) => _dbFactory = dbFactory;

    public async Task<int> CreateAccountAsync(Account account)
    {
        using var conn = _dbFactory.CreateConnection();
        var sql = @"
            INSERT INTO Accounts (AccountType, Currency)
            OUTPUT INSERTED.AccountId
            VALUES (@AccountType, @Currency)";
        
        return await conn.ExecuteScalarAsync<int>(sql, account);
    }

    public async Task UpdateAccountAsync(Account account)
    {
        using var conn = _dbFactory.CreateConnection();
        var sql = @"
            UPDATE Accounts 
            SET AccountType = @AccountType, Currency = @Currency
            WHERE AccountId = @AccountId";
        
        await conn.ExecuteAsync(sql, account);
    }
}

// Similar implementations for SignerRepository, DocumentRepository, etc.
```

---

### **Step 5: Application Services (Core Layer)**
Orchestrate business logic for each tab:

```csharp
// Core/Services/AccountService.cs
public class AccountService(
    IAccountRepository accountRepo,
    ISignerRepository signerRepo,
    IDocumentRepository docRepo,
    IPreferenceRepository prefRepo)
{
    // Create Account (Tab 1)
    public async Task<int> CreateAccountAsync(AccountDto dto)
    {
        var account = new Account 
        { 
            AccountType = dto.AccountType, 
            Currency = dto.Currency 
        };
        return await accountRepo.CreateAccountAsync(account);
    }

    // Add Signers (Tab 2)
    public async Task AddSignerAsync(int accountId, SignerDto dto)
    {
        var signer = new Signer 
        { 
            AccountId = accountId, 
            Name = dto.Name, 
            Email = dto.Email 
        };
        await signerRepo.AddSignerAsync(signer);
    }

    // Similar methods for Documents, Preferences, etc.
}
```

---

### **Step 6: API Controllers (Presentation Layer)**
Create controllers for each tab, all using the shared `AccountId`:

```csharp
[ApiController]
[Route("api/accounts")]
public class AccountsController : ControllerBase
{
    private readonly AccountService _accountService;

    public AccountsController(AccountService accountService) => _accountService = accountService;

    // Tab 1: Create Account
    [HttpPost]
    public async Task<ActionResult<int>> CreateAccount(AccountDto dto)
    {
        var accountId = await _accountService.CreateAccountAsync(dto);
        return Ok(accountId);
    }
}

[ApiController]
[Route("api/accounts/{accountId}/signers")]
public class SignersController : ControllerBase
{
    private readonly AccountService _accountService;

    public SignersController(AccountService accountService) => _accountService = accountService;

    // Tab 2: Add Signer
    [HttpPost]
    public async Task<IActionResult> AddSigner(int accountId, SignerDto dto)
    {
        await _accountService.AddSignerAsync(accountId, dto);
        return Ok();
    }

    // GET: api/accounts/5/signers
    [HttpGet]
    public async Task<ActionResult<List<SignerDto>>> GetSigners(int accountId)
    {
        var signers = await _accountService.GetSignersByAccountIdAsync(accountId);
        return Ok(signers);
    }
}

// Repeat for DocumentsController, PreferencesController...
```

---

### **Step 7: Validation (Core Layer)**
Add FluentValidation rules for each DTO:

```csharp
// Core/Validators/AccountValidator.cs
public class AccountValidator : AbstractValidator<AccountDto>
{
    public AccountValidator()
    {
        RuleFor(x => x.AccountType).NotEmpty();
        RuleFor(x => x.Currency).Length(3);
    }
}

// Core/Validators/SignerValidator.cs
public class SignerValidator : AbstractValidator<SignerDto>
{
    public SignerValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.Email).EmailAddress();
    }
}
```

---

### **Step 8: Database Setup**
Example SQL table for `Accounts` (repeat for other tabs):
```sql
CREATE TABLE Accounts (
    AccountId INT PRIMARY KEY IDENTITY(1,1),
    AccountType NVARCHAR(50) NOT NULL,
    Currency NVARCHAR(3) NOT NULL
);

CREATE TABLE Signers (
    SignerId INT PRIMARY KEY IDENTITY(1,1),
    AccountId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId)
);
```

---

### **Step 9: Dependency Injection**
Register services and repositories in `Program.cs`:
```csharp
builder.Services.AddScoped<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<ISignerRepository, SignerRepository>();
// ... Register other repositories

builder.Services.AddScoped<AccountService>();

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<AccountValidator>();
```

---

### **Step 10: Testing the API**
**1. Create Account (Tab 1):**
```http
POST /api/accounts
Content-Type: application/json

{
  "accountType": "Savings",
  "currency": "USD"
}
```
**Response:**
```json
5 // Generated AccountId
```

**2. Add Signer (Tab 2):**
```http
POST /api/accounts/5/signers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**3. Get Signers (Tab 2):**
```http
GET /api/accounts/5/signers
```
**Response:**
```json
[
  { "name": "John Doe", "email": "john@example.com" }
]
```

---

### **Key Considerations**
1. **Transaction Management**: Use `TransactionScope` for atomic operations across multiple tabs.
2. **Error Handling**: Throw custom exceptions (e.g., `AccountNotFoundException`) and handle them globally.
3. **Security**: Validate user ownership of `AccountId` in each request (e.g., using JWT claims).
4. **File Uploads**: For the Documents tab, handle file uploads with `IFormFile` and store paths in the database.
5. **PATCH Endpoints**: Add partial updates for individual tabs if needed.

This design ensures scalability, separation of concerns, and easy maintenance as each tab’s logic is isolated but linked by `AccountId`.
