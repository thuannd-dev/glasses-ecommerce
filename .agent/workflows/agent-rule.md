---
description: ASP.NET Core 9 Project, EF Core Performance Rules, Business Rules, API Design - Current user resource pattern
---

# ASP.NET Core 9 Project Rules

- Use C# 13 language features where appropriate
- Follow SOLID principles in class and interface design
- Implement dependency injection for loose coupling
- Use primary constructors for dependency injection in services, use cases, etc.
- Use async/await for I/O-bound operations
- Prefer record types for immutable data structures
- Prefer controller endpoints over minimal APIs
- Utilize minimal APIs for simple endpoints (when explicitly stated or when it makes sense)
- Implement proper exception handling and logging
- Use strongly-typed configuration with IOptions pattern
- Implement proper authentication and authorization
- Use Entity Framework Core for database operations
- Implement proper versioning for APIs
- Implement proper caching strategies
- Use middleware for cross-cutting concerns
- Use environment-specific configuration files
- Implement proper CORS policies
- Use secure communication with HTTPS
- Implement proper model validation
- Implement proper logging with structured logging
- Favor explicit typing (this is very important). Only use var when evident.
- **NEVER use `var` for query results, entity types, value types, or collection types.**
  The Carts and Addresses modules use ZERO `var`. Always follow that standard.
  Only acceptable `var` usage: anonymous types from LINQ GroupBy (where explicit typing is impossible).

  ```csharp
  //  WRONG — var hides the type
  var order = await context.Orders.FirstOrDefaultAsync(...);
  var oldStatus = order.OrderStatus;
  var items = await context.OrderItems.ToListAsync(ct);
  var isSuccess = await context.SaveChangesAsync(ct) > 0;
  foreach (var item in order.OrderItems) { }

  //  CORRECT — explicit types
  Order? order = await context.Orders.FirstOrDefaultAsync(...);
  OrderStatus oldStatus = order.OrderStatus;
  List<OrderItem> items = await context.OrderItems.ToListAsync(ct);
  bool isSuccess = await context.SaveChangesAsync(ct) > 0;
  foreach (OrderItem item in order.OrderItems) { }
  ```

- Make types internal and sealed by default unless otherwise specified
- Prefer Guid for identifiers unless otherwise specified

# CQRS / MediatR Class Structure (CRITICAL)

Every Command/Query file MUST follow this exact access modifier pattern:

```csharp
// Outer wrapper — public sealed
public sealed class CreateSomething
{
    // Command/Query — public sealed
    public sealed class Command : IRequest<Result<SomeDto>>
    {
        public required SomeDto Dto { get; set; }
    }

    // Handler — internal sealed (NOT public)
    internal sealed class Handler(
        AppDbContext context,
        IMapper mapper,
        IUserAccessor userAccessor) : IRequestHandler<Command, Result<SomeDto>>
    {
        public async Task<Result<SomeDto>> Handle(Command request, CancellationToken ct)
        {
            // ...
        }
    }
}
```

**Common mistakes to avoid:**

- `public class Handler` → Must be `internal sealed class Handler`
- `public class CreateSomething` → Must be `public sealed class CreateSomething`
- `public class Command` → Must be `public sealed class Command`

**Reference modules:** Carts (AddItemToCart.cs), Addresses (CreateAddress.cs)

# Validator Conventions

- Validators validate the **Command/Query**, NOT the DTO directly.

  ```csharp
  // CORRECT
  public sealed class CreateStaffOrderValidator : AbstractValidator<CreateStaffOrder.Command>

  // WRONG
  public sealed class CreateStaffOrderValidator : AbstractValidator<CreateStaffOrderDto>
  ```

- Use `public sealed class` for validators.
- Access DTO fields through the Command: `RuleFor(x => x.Dto.FieldName)`.
- **Always add a Dto null guard** before any rules that access `x.Dto.*` properties.
  Without this, a null Dto causes `NullReferenceException` instead of a validation error.

  ```csharp
  public sealed class SomeValidator : AbstractValidator<SomeCommand.Command>
  {
      public SomeValidator()
      {
          RuleFor(x => x.Dto)
              .NotNull().WithMessage("Request body is required.");

          When(x => x.Dto != null, () =>
          {
              RuleFor(x => x.Dto.FieldName)
                  .NotEmpty().WithMessage("...");
              // ... all other x.Dto.* rules go here
          });
      }
  }
  ```

# EF Core performance guidelines:

- Use AsNoTracking and projection for read-only queries.
- Use AsSplitQuery for queries with multiple collections.
- Apply optimizations only when they fit the query intent and data volume.

# Business Rules

- Read through all the classes in the Domain folder to understand the business rules

# API DESIGN – CURRENT USER RESOURCE PATTERN

- Always resolve the current user's identity exclusively from authentication claims
  (HttpContext.User), never from route, query, or request body.

- Use a UserAccessor (Infrastructure layer) as the single abstraction for accessing
  the current user context (UserId, roles, email, etc.).

- NEVER trust client-supplied identifiers (userId) for self-service resources.

- Prefer `/api/me/...` endpoints over `/api/users/{id}` for authenticated user data.

- `/api/users/{id}` endpoints are allowed ONLY for privileged roles
  (e.g. Admin, Manager) and MUST enforce role- or policy-based authorization.

# Canonical API Reference

The canonical API reference is:

- API/Controllers/ActivitiesController.cs
- Application/Activities/\*\*
- Infrastructure/Security/\*\*
- Domain/\*\*
- Persistence/\*\*

# When generating new APIs:

- Always analyze ActivitiesController and its referenced Application layer first.
- Reuse the same controller structure, request/response DTO patterns, MediatR usage, validation, and error handling.
- Do NOT introduce new patterns, abstractions, or optimizations.
- Consistency with Activities API is mandatory.

# DTO File Conventions

- **One class per file** — each DTO class must be in its own `.cs` file.
  Do NOT put multiple classes in the same file, even if they are related (e.g. `PrescriptionInputDto` and `PrescriptionDetailInputDto` must be in separate files).
- **File name = class name** — `MyDto.cs` contains only `class MyDto`.
- **All DTOs must use `public sealed class`**, not `public class`.
- **Description comment** — add a single-line `//` comment directly above the class declaration describing what the DTO is for, e.g.:
  ```csharp
  //Dto Request để add item
  public sealed class AddCartItemDto
  ```

# Concurrency & Invariant Enforcement Rules

## Fail-fast over silent correction

For invalid input (pagination params, missing entities, bad enum values), always return an explicit `Result.Failure(..., 4xx)` rather than silently correcting/clamping:

```csharp
// WRONG — hides bad input from the caller
int pageSize = Math.Clamp(request.PageSize, 1, 100);

// CORRECT
if (request.PageNumber < 1 || request.PageSize < 1 || request.PageSize > 100)
    return Result<PagedResult<T>>.Failure("Invalid pagination parameters.", 400);
```

## Guard empty collections with early return before SQL `IN (...)`

Never use `if/else { list = [] }` fallback. Use early-return guard:

```csharp
// WRONG
List<Stock> stocks;
if (variantIds.Count == 0) stocks = [];
else stocks = await context.Stocks.FromSqlRaw(...).ToListAsync(ct);

// CORRECT — follow ApproveInbound.cs pattern
if (items.Count == 0)
    return Result<Unit>.Failure("Order has no items.", 400);
List<Stock> stocks = await context.Stocks.FromSqlRaw(...).ToListAsync(ct);
```

## Strict stock invariants — never skip or clamp

Stock adjustment code must fail explicitly, never skip or clamp:

```csharp
// WRONG
Stock? stock = stocks.FirstOrDefault(s => s.ProductVariantId == item.ProductVariantId);
if (stock != null)
    stock.QuantityReserved = Math.Max(0, stock.QuantityReserved - item.Quantity);

// CORRECT
Dictionary<Guid, Stock> stockByVariant = stocks.ToDictionary(s => s.ProductVariantId);
if (!stockByVariant.TryGetValue(item.ProductVariantId, out Stock? stock))
    return Result<Unit>.Failure($"Stock record not found for variant '{item.ProductVariantId}'.", 409);
if (stock.QuantityReserved < item.Quantity)
    return Result<Unit>.Failure($"Insufficient reserved stock for variant '{item.ProductVariantId}'.", 409);
stock.QuantityReserved -= item.Quantity;
```

## Proactively scan sibling files when fixing a pattern

When fixing a bug in one handler, immediately grep the entire codebase for the same pattern and fix all occurrences in the same response. Do not wait to be asked. Common patterns to scan:

- `Math.Max(0,` on stock fields
- `stock != null` silent-skip
- missing `AsNoTracking()` on read-only queries
- missing `RepeatableRead` transaction on read-then-write

## `await using` is sufficient for transaction rollback

`await using IDbContextTransaction` auto-rollbacks on `DisposeAsync()` if `CommitAsync()` was never called. Do NOT add explicit `RollbackAsync()` before each `return` failure — it's redundant boilerplate and can shadow exceptions.

## Always apply `AsNoTracking()` on read-only list queries

All list queries using `ProjectTo<T>` must include `.AsNoTracking()`:

```csharp
IQueryable<Order> query = context.Orders.AsNoTracking();
```

## Use `IsNullOrWhiteSpace` for optional string fields

Never use `!= null` to check optional strings. Use `IsNullOrWhiteSpace` to treat `""` and whitespace the same as `null`:

```csharp
// WRONG — "" passes through
Notes = string.Join("; ", g.Where(i => i.Notes != null).Select(i => i.Notes!))

// CORRECT
Notes = g.Where(i => !string.IsNullOrWhiteSpace(i.Notes))
          .Select(i => i.Notes!)
          .DefaultIfEmpty(null)
          .Aggregate((a, b) => $"{a}; {b}"),
// and at storage:
Notes = string.IsNullOrWhiteSpace(item.Notes) ? null : item.Notes,
```
