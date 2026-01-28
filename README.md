# Order đang auto include PromoUsageLogs để tính FinalAmount

- Khi chỉ cần lấy Order thì nhớ ignore PromoUsageLogs trong query để tránh truy vấn thừa

```bash
db.Orders
  .IgnoreAutoIncludes()
  .Select(...)
```

# Installation

## Requirements

- .NET SDK 9

## Visual Studio Code

1. Install extension "C# Dev Kit", "NuGet Gallery", "SQLite Viewer"
2. dotnet new sln
3. dotnet new webapi -n API -controllers
4. dotnet new classlib -n Domain
5. dotnet new classlib -n Application
6. dotnet new classlib -n Persistence
7. dotnet sln add API
8. dotnet sln add Application
9. dotnet sln add Domain
10. dotnet sln add Persistence
11. API reference tới Application
12. Application reference tới Domain, Persistence
13. Persistence reference tới Domain
14. Domain không reference project nào
15. Check the certificate

```bash
dotnet dev-certs https -c
```

16. If you have problems with your browser trusting the certificate please try the following:

```bash
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

17. In API/Properties/launchSettings.json

```json
{
  "$schema": "https://json.schemastore.org/launchsettings.json",
  "profiles": {
    "https": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": false,
      "applicationUrl": "https://localhost:5001",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

18, In API.csproj remove beacause we not use swagger

```xml
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.11" />
  </ItemGroup>
```

19. Delete API.http in API folder

20. Initialize Repository

21. dotnet new gitignore

22. Copy old folder, files to new project

23. Migrate database

```bash
dotnet ef migrations add InitialCreate --project Persistence --startup-project API

dotnet ef database update --project Persistence --startup-project API
```
