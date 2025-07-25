# Technical Specification Document (TSD)

## Project Tracking Application

### 1. System Overview

The Project Tracking Application is built using a modern web stack with TypeScript, providing a scalable and maintainable solution for project management.

### 2. Technology Stack

#### 2.1 Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database:** SQLite (development) / PostgreSQL (production ready)
- **ORM:** Prisma (with fallback to direct SQL)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **API:** RESTful services

#### 2.2 Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **State Management:** React Query
- **Form Handling:** React Hook Form
- **Icons:** Lucide React

#### 2.3 Development Tools
- **Linting:** ESLint
- **Type Checking:** TypeScript compiler
- **Process Management:** Nodemon
- **Package Manager:** npm

### 3. System Architecture

#### 3.1 Application Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │    Database     │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (SQLite)      │
│   Port: 3000    │    │   Port: 3001    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 3.2 Database Schema

**Core Entities:**
- **Users:** Authentication and role management
- **Projects:** Project details, PO information, budgets
- **Resources:** Resource profiles and cost information
- **Milestones:** Project milestones and billing information
- **ResourceAllocations:** Resource-to-project assignments
- **Expenses:** Project expenses tracking
- **Invoices:** Billing and payment tracking

#### 3.3 API Design

**Authentication Endpoints:**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration

**Project Management:**
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `PATCH /api/projects/:id/status` - Update project status

**Resource Management:**
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `GET /api/resources/:id` - Get resource details
- `PUT /api/resources/:id` - Update resource
- `POST /api/resources/:id/allocations` - Allocate resource

**Financial Tracking:**
- `GET /api/financial/expenses` - List expenses
- `POST /api/financial/expenses` - Create expense
- `GET /api/financial/invoices` - List invoices
- `POST /api/financial/invoices` - Create invoice
- `GET /api/financial/budget/:projectId` - Budget analysis

**Reporting:**
- `GET /api/reports/dashboard` - Dashboard overview
- `GET /api/reports/project-status` - Project status report
- `GET /api/reports/resource-utilization` - Resource utilization
- `GET /api/reports/financial-summary` - Financial summary

### 4. Security Specifications

#### 4.1 Authentication & Authorization
- JWT-based authentication with 24-hour token expiration
- Role-based access control (RBAC)
- Password hashing using bcryptjs with salt rounds
- Environment-based secret management

#### 4.2 API Security
- CORS protection with configurable origins
- Rate limiting (100 requests per 15 minutes per IP)
- Helmet.js for security headers
- Input validation using Joi schemas

#### 4.3 Data Protection
- Sensitive data stored in environment variables
- Database connection strings secured
- No plain text password storage

### 5. Deployment Architecture

#### 5.1 Development Environment
```
npm run dev → Starts both frontend and backend concurrently
├── Backend: http://localhost:3001
└── Frontend: http://localhost:3000
```

#### 5.2 Production Architecture (Planned)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Application   │    │   Database      │
│   (Azure LB)    │◄──►│   Server        │◄──►│   (PostgreSQL)  │
│                 │    │   (Docker)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 6. Database Design

#### 6.1 User Management
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'PROJECT_MANAGER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.2 Project Management
```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    projectId TEXT UNIQUE NOT NULL,
    description TEXT,
    poNumber TEXT NOT NULL,
    poDate DATETIME NOT NULL,
    poAmount DECIMAL NOT NULL,
    clientName TEXT NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    budget DECIMAL NOT NULL,
    status TEXT DEFAULT 'PLANNED',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdBy TEXT REFERENCES users(id)
);
```

### 7. Performance Specifications

#### 7.1 Response Time Requirements
- API endpoints: < 500ms response time
- Database queries: < 200ms execution time
- Page load time: < 2 seconds
- Real-time updates: < 1 second

#### 7.2 Scalability
- Support for 100+ concurrent users
- Handle 1000+ projects
- Process 10,000+ financial transactions

### 8. Error Handling

#### 8.1 API Error Responses
```json
{
  "error": "Error message",
  "message": "Detailed description (development only)"
}
```

#### 8.2 HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### 9. Environment Configuration

#### 9.1 Environment Variables
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:3000"
```

### 10. Testing Strategy

#### 10.1 Unit Testing (Planned)
- Jest for JavaScript/TypeScript testing
- API endpoint testing
- Database operation testing

#### 10.2 Integration Testing (Planned)
- End-to-end API testing
- Database integration testing
- Authentication flow testing

### 11. Monitoring and Logging

#### 11.1 Application Logging
- Console logging for development
- Structured logging for production
- Error tracking and reporting

#### 11.2 Health Monitoring
- Health check endpoint: `/health`
- Database connection monitoring
- API response time monitoring

### 12. Current Implementation Status

✅ **Completed Features:**
- Authentication system with JWT
- Database schema and setup
- Basic API structure
- TypeScript configuration
- Development environment setup
- Demo data and credentials

🚧 **Known Issues:**
- Prisma client generation requires network access
- Some TypeScript strict mode compliance needed
- Frontend integration pending

📋 **Next Steps:**
- Complete Prisma setup or implement alternative ORM
- Fix remaining TypeScript issues
- Implement frontend authentication flow
- Add comprehensive error handling
- Set up CI/CD pipeline