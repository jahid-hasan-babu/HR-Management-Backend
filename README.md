# HR Management Backend API

A RESTful API for managing HR operations including employee management, daily attendance tracking, and monthly attendance reports.

## Tech Stack

- **Runtime**: Node.js with TypeScript (OOP)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Query Builder**: Knex.js
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **File Uploads**: Multer
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update with your database credentials:
   ```bash
   cp .env.example .env
   ```
4. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE hr_management;
   ```
5. Run migrations:
   ```bash
   npm run migrate
   ```
6. Seed the database with a default HR user:
   ```bash
   npm run seed
   ```
7. Start the development server:
   ```bash
   npm run dev
   ```

### Default HR User

After seeding, you can login with:
- **Email**: `admin@hr.com`
- **Password**: `password123`

## API Endpoints

API Documentation: https://july-s-team.docs.buildwithfern.com

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | HR user login (returns JWT) |

### Employees (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | List all employees (paginated, searchable) |
| GET | `/employees/:id` | Get employee by ID |
| POST | `/employees` | Create employee (multipart/form-data) |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Soft delete employee |

### Attendance (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/attendance` | List attendance (filterable) |
| GET | `/attendance/:id` | Get attendance by ID |
| POST | `/attendance` | Create/upsert attendance |
| PUT | `/attendance/:id` | Update attendance |
| DELETE | `/attendance/:id` | Delete attendance |

### Reports (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/attendance` | Monthly attendance report |

## Query Examples

```bash
# Search employees by name
GET /employees?search=rahim

# Filter attendance by employee and date range
GET /attendance?employee_id=12&from=2025-08-01&to=2025-08-31

# Monthly attendance report
GET /reports/attendance?month=2025-08
GET /reports/attendance?month=2025-08&employee_id=12
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm run migrate` | Run database migrations |
| `npm run migrate:rollback` | Rollback last migration |
| `npm run seed` | Seed the database |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
├── app.ts                        # Express app setup
├── server.ts                     # Entry point
├── config/
│   ├── database.ts               # Knex connection pool
│   ├── env.ts                    # Environment config
│   └── multer.ts                 # File upload config
├── database/
│   ├── migrations/               # Knex migrations
│   └── seeds/                    # Database seeds
├── errors/
│   ├── AppError.ts               # Base error class
│   └── HttpException.ts          # HTTP error class
├── middlewares/
│   ├── auth.middleware.ts         # JWT verification
│   ├── error.middleware.ts        # Global error handler
│   └── validate.middleware.ts     # Joi validation
├── modules/
│   ├── auth/                     # Authentication module
│   ├── employee/                 # Employee CRUD module
│   ├── attendance/               # Attendance CRUD module
│   └── report/                   # Reports module
├── types/                        # TypeScript interfaces
├── utils/                        # Utility functions
└── validators/                   # Joi schemas
```
