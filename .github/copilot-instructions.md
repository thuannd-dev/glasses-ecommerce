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
