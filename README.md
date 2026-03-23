<div align="center">

# Glasses E-Commerce

**A specialized e-commerce platform for eyewear, supporting diverse order workflows including standard, prescription-based, and pre-orders with dynamic promotional rules.**

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/) [![EF Core](https://img.shields.io/badge/EF%20Core-9.0-388E3C?logo=nuget)](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore) [![Architecture](https://img.shields.io/badge/Architecture-DDD%20%7C%20Clean%20%7C%20CQRS-FF4081)]() [![Azure](https://img.shields.io/badge/Deployed-Azure%20App%20Service-0078D4?logo=microsoftazure)](https://azure.microsoft.com/) [![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions)](https://github.com/features/actions) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Highlights

### Architecture

Structured with **Domain-Driven Design (DDD)** and **Clean Architecture** using the **CQRS pattern** (MediatR). Integrated pipeline behaviors for seamless cross-cutting concerns (validation, logging), the **Result pattern** for explicit error handling, and **custom authorization** policies.

### Core Features

Focused heavily on production-grade reliability:

- **Database Optimization** via extensive EF Core Indexing.
- **Data Integrity** guaranteed through **Pessimistic Concurrency**, explicit **database-level transactions**, and **Serializable isolation** for promotions.
- **Row-Level Locking (UPDLOCK)** for inventory to prevent overselling.
- **Idempotent Retry** mechanisms to handle network-level failures gracefully.

### DevOps & CI/CD

- **GitHub Actions** pipelines for automated, unified builds on every push.
- **Zero-downtime deployments** to **Azure App Service** with **OIDC (JWT)** authentication.
- Containerized local development via **Docker Compose** with secured secrets management.

**Frontend:** `React 19` · `Vite` · `TypeScript` · `Tailwind CSS v4` · `Material UI (MUI)` · `MobX` · `React Query` · `React Hook Form` · `Zod`<br>
**Backend:** `ASP.NET Core 9.0` · `Entity Framework Core` · `MediatR` · `AutoMapper` · `FluentValidation` · `Scalar` · `Cloudinary` · `SQL Server`<br>
**DevOps:** `Docker` · `GitHub Actions` · `Azure Apps`

---

## Application Architecture

The application is structured into clearly defined layers, enforcing a one-way dependency rule towards the core business logic (Domain).

<div align="center">
  <img src="https://drive.usercontent.google.com/download?id=1GZk0-Ur7bn0NLGEs-hUJvQhnY5fkepbX" alt="Application Architecture" width="800" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
</div>

### Layer Breakdown:

1. **Domain**: The heart of the system. Contains all enterprise logic, entities, value objects, and domain events. Dependent on nothing.
2. **Application**: Contains the business use cases (Commands and Queries), Interfaces, DTOs, and Validators. Dependent only on Domain.
3. **Infrastructure**: Implements external concerns like third-party integrations (VNPAY, GHN Webhooks, Cloudinary).
4. **Persistence**: EF Core DbContext, Migrations, and database-specific configurations (SQL Server).
5. **API**: The entry point. Handles HTTP requests, Routing, Middleware, and Dependency Injection setup.

---

## Infrastructure & Tech Stack

Our infrastructure relies on reliable and industry-standard tools for deployment, data management, and external services.

<div align="center">
  <img src="https://drive.usercontent.google.com/download?id=1Wd8gj3ooQG5nxesPWHqxD7SqLe-ueLV3" alt="Infrastructure Overview" width="800" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
</div>

### Core Technologies

- **Framework:** .NET 9 Web API
- **ORM:** Entity Framework Core 9
- **Database:** SQL Server (Production) / SQLite (Local/Testing flexibility)
- **Mediator Pattern:** MediatR (v13.0)
- **Validation:** FluentValidation
- **Object Mapping:** AutoMapper
- **Third-Party Services:** VNPAY Gateway, GHN (Giao Hàng Nhanh), Cloudinary

---

## Engineering Highlights

### Backend & Infrastructure
| Area               | Detail                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Architecture**   | DDD + Clean Architecture with CQRS (MediatR) · Pipeline behaviors for validation & logging · Result pattern for error handling · Custom authorization policies                             |
| **Data Integrity** | Pessimistic Concurrency · Explicit DB-level Transactions · Serializable isolation for promotions · Row-Level Locking (`UPDLOCK`) for inventory · Idempotent Retry against network failures |
| **Performance**    | Extensive EF Core Indexing · Selective `IgnoreAutoIncludes()` to eliminate N+1 overhead on heavy joins                                                                                     |
| **DevOps & CI/CD** | GitHub Actions for unified CI builds · Zero-downtime deployments to Azure App Service via OIDC (JWT) · Docker Compose for local dev · Secured secrets management                           |

### Frontend UI & Architecture
| Area               | Detail                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **State & Cache**  | Robust global state via **MobX** · High-performance server-state synchronization and caching using **React Query**                                                                         |
| **Modern UI/UX**   | Lightning-fast builds with **React 19 + Vite** · Custom design system blending **Tailwind CSS v4** styling and **Material UI (MUI)** components · Fluid animations via **Framer Motion**   |
| **Type-Safe Forms**| Complex, high-performance wizard forms driven by **React Hook Form** and strictly validated using **Zod** schemas                                                                          |
| **Rich Features**  | Interactive location mapping with **Leaflet** · 3D visualizations via **Three.js** · Drag-and-drop operations with **dnd-kit** · Rich data analytics using **Recharts**                    |

---

## Getting Started

### Prerequisites

- [.NET SDK 9.0+](https://dotnet.microsoft.com/download/dotnet/9.0)
- [EF Core CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) (`dotnet tool install --global dotnet-ef`)
- SQL Server (or LocalDB)

### Local Setup Instructions

**1. Clone the repository**

```bash
git clone https://github.com/thuannd-dev/glasses-ecommerce.git
cd glasses-ecommerce
```

**2. Restore dependencies**

```bash
dotnet restore
```

**3. Set up the development environment (VS Code)**

- Recommended Extensions: **C# Dev Kit**, **NuGet Gallery**, **SQLite Viewer** (if using SQLite)
- Trust the HTTPS development certificate:

```bash
dotnet dev-certs https -c
# If you encounter browser trust issues, run:
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

**4. Configure settings**

- Navigate to the `API` directory.
- Copy `appsettings.Development.example.json` and rename it to `appsettings.Development.json`.
- Fill in the required values:

| Section              | Key(s)                                         | Description                                |
| -------------------- | ---------------------------------------------- | ------------------------------------------ |
| `ConnectionStrings`  | `DefaultConnection`                            | SQL Server connection string               |
| `CloudinarySettings` | `CloudName`, `ApiKey`, `ApiSecret`             | Cloudinary media storage credentials       |
| `VnPay`              | `TmnCode`, `HashSecret`, `ReturnUrl`, `IpnUrl` | VNPAY merchant credentials & callback URLs |
| `GHN`                | `Token`, `ShopId`, `ClientId`                  | GHN shipping API credentials               |
| `EmailSettings`      | `SmtpUsername`, `SmtpPassword`, `FromEmail`    | SMTP credentials for transactional email   |

> [!NOTE]
> For `VnPay.IpnUrl` to work, you must register it in the [VNPay merchant portal](https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login). Without registration, IPN callbacks will silently fail.

**5. Apply database migrations**
Migrations are already included in the repo. Just run:

```bash
dotnet ef database update --project Persistence --startup-project API
```

**6. Run the Application**

```bash
cd API
dotnet watch
```

> The API will start and the **Scalar API Reference** will be available in your browser for interactive API exploration.

---

### Frontend Setup

**Prerequisites:** [Node.js 18+](https://nodejs.org/) and npm

**1. Navigate to the client directory**

```bash
cd client
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

- Copy `.env.development` and fill in your credentials:

```env
VITE_API_URL=https://localhost:5001/api
VITE_LOCATIONIQ_API_KEY=your_locationiq_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_OPENAI_API_URL=https://api.openai.com/v1/responses
VITE_OPENAI_MODEL=gpt-4o-mini
```

**4. Run the development server**

```bash
npm run dev
```

---

## Database Schema (ERD)

<div align="center">
  <img src="https://drive.usercontent.google.com/download?id=1jdmcLx6yzGvkFqgenQUoGFpslr1iV0WH" alt="Entity Relationship Diagram" width="800" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-top: 15px;"/>
</div>
