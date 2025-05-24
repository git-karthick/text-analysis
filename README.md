To display **account details along with its signers** in a .NET 8 Web API when the data is split across two tables, you can follow these steps using a layered architecture (Core/Application layer for business logic and Infrastructure layer for data access):

---

### **1. Define Domain Models**
First, model the relationship between `Account` and `Signer` entities in the **Core layer**:
```csharp
// Core/Domain/Account.cs
public class Account
{
    public int Id { get; set; }
    public string AccountNumber { get; set; }
    public string AccountType { get; set; }
    public List<Signer> Signers { get; set; } // One-to-many relationship
}

// Core/Domain/Signer.cs
public class Signer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public int AccountId { get; set; } // Foreign key
    public Account Account { get; set; }
}
```

---

### **2. Create DTOs (Data Transfer Objects)**
Define DTOs to shape the response:
```csharp
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

### **3. Repository Interfaces**
Define repository contracts in the **Core layer** (implementation in Infrastructure):
```csharp
// Core/Interfaces/IAccountRepository.cs
public interface IAccountRepository
{
    Task<Account> GetAccountWithSignersAsync(int accountId);
}

// Core/Interfaces/ISignerRepository.cs (if needed)
public interface ISignerRepository
{
    Task<List<Signer>> GetSignersByAccountIdAsync(int accountId);
}
```

---

### **4. Application Service**
In the **Core/Application layer**, create a service to fetch and combine data:
```csharp
// Core/Services/AccountService.cs
public class AccountService(IAccountRepository accountRepo, IMapper mapper)
{
    public async Task<AccountDetailsDto> GetAccountDetailsAsync(int accountId)
    {
        // Fetch account with signers using the repository
        var account = await accountRepo.GetAccountWithSignersAsync(accountId);
        if (account == null)
            throw new AccountNotFoundException(accountId);

        // Map to DTO
        var accountDto = mapper.Map<AccountDetailsDto>(account);
        return accountDto;
    }
}
```

---

### **5. Repository Implementation (Infrastructure Layer)**
In the **Infrastructure layer**, implement the repository using EF Core:
```csharp
// Infrastructure/Repositories/AccountRepository.cs
public class AccountRepository : IAccountRepository
{
    private readonly AppDbContext _context;

    public AccountRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Account> GetAccountWithSignersAsync(int accountId)
    {
        return await _context.Accounts
            .Include(a => a.Signers) // Eagerly load signers
            .FirstOrDefaultAsync(a => a.Id == accountId);
    }
}
```

---

### **6. AutoMapper Configuration**
Map entities to DTOs in the **Core layer**:
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

### **7. API Controller**
Expose the endpoint in the **Presentation layer** (API project):
```csharp
// Controllers/AccountsController.cs
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

### **8. Handle Exceptions**
Add custom exceptions and global error handling:
```csharp
// Core/Exceptions/AccountNotFoundException.cs
public class AccountNotFoundException : Exception
{
    public AccountNotFoundException(int accountId)
        : base($"Account with ID {accountId} not found.") { }
}
```

---

### **Key Considerations**
1. **Eager Loading**: Use `Include()` in EF Core to load related `Signer` data in a single query.
2. **Performance**: Avoid the N+1 query problem by fetching `Account` and `Signer` in one query.
3. **Separation of Concerns**: Keep data access logic in repositories and business logic in services.
4. **DTOs**: Prevent exposing internal domain models directly to the API response.

---

### **Testing the Endpoint**
Test using tools like **Swagger** or **Postman**:
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

This approach ensures clean separation of layers, efficient data retrieval, and a well-structured API response.