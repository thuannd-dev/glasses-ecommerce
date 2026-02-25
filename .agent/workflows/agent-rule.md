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
- Make types internal and sealed by default unless otherwise specified
- Prefer Guid for identifiers unless otherwise specified

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
- **Description comment** — add a single-line `//` comment directly above the class declaration describing what the DTO is for, e.g.:
  ```csharp
  //Dto Request để add item
  public sealed class AddCartItemDto
  ```
