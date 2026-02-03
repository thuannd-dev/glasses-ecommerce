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
- EF Core CLI

```bash
dotnet tool install --global dotnet-ef
```

1. clone repo

```bash
git clone https://github.com/thuannd-dev/glasses-ecommerce.git
```

2. `cd glasses-ecommerce`

3. `dotnet restore`

## Visual Studio Code

4. Install extension "C# Dev Kit", "NuGet Gallery", "SQLite Viewer"
5. Check the certificate

```bash
dotnet dev-certs https -c
```

6. If you have problems with your browser trusting the certificate please try the following:

```bash
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

7. Configuration

Copy appsettings.Development.example.json

Rename to appsettings.Development.json

8. Migrate database

```bash
dotnet ef migrations add InitialCreate --project Persistence --startup-project API

dotnet ef database update --project Persistence --startup-project API
```

9. cd API

10. `dotnet watch`

<img src="https://drive.usercontent.google.com/download?id=1jdmcLx6yzGvkFqgenQUoGFpslr1iV0WH"/>
