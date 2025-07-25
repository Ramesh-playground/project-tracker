# Project Tracker

A comprehensive project tracking application designed to manage project details, resources, financials, milestones, and tracking of project health from initiation to closure.

## Features

### 🎯 Project Management Module
- Create, edit, and archive project details
- Track project attributes including PO details, duration, budget
- Resource allocation and milestone tracking
- Project status management (Planned, In Progress, On Hold, Completed, Archived)

### 👥 Resource Management Module
- Maintain detailed resource profiles with contact details and experience
- Track resource costs (salary, hourly rate)
- Manage skills and certifications
- Resource allocation across multiple projects
- Utilization tracking and reporting

### 🎯 Milestone Management Module
- Define, track, and update project milestones
- Billing milestones linked to project financials
- Status indicators (On-track, Delayed, Completed)
- Timeline visualization

### 💰 Financial Tracking Module
- Budget management with real-time expenditure tracking
- Budget overrun alerts
- Billing management with milestone-based invoicing
- Invoice generation and payment tracking

### 📊 Monitoring and Reporting Module
- Track slippage in effort, duration, and milestones
- Comprehensive dashboard with project health metrics
- Standard and custom reports
- Real-time alerts and notifications

## Technology Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database operations and migrations
- **SQLite** - Database (easily migrated to PostgreSQL)
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe frontend development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Lucide React** - Icon library

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- SQLite3 (for database operations)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-tracker
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up the database**
   ```bash
   ./setup.sh
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp src/backend/.env.example src/backend/.env
   # Edit the .env file with your configuration
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   This starts both the backend (port 3001) and frontend (port 3000) concurrently.

### Demo Credentials

The application comes with pre-configured demo accounts:

- **Admin User**: admin@demo.com / password
- **Project Manager**: pm@demo.com / password

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Project Endpoints
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `PATCH /api/projects/:id/status` - Update project status
- `GET /api/projects/:id/dashboard` - Get project dashboard data

### Resource Endpoints
- `GET /api/resources` - List all resources
- `POST /api/resources` - Create new resource
- `GET /api/resources/:id` - Get resource details
- `PUT /api/resources/:id` - Update resource
- `POST /api/resources/:id/allocations` - Allocate resource to project
- `GET /api/resources/:id/utilization` - Get resource utilization report

### Milestone Endpoints
- `GET /api/milestones` - List milestones
- `POST /api/milestones` - Create milestone
- `GET /api/milestones/:id` - Get milestone details
- `PUT /api/milestones/:id` - Update milestone
- `PATCH /api/milestones/:id/status` - Update milestone status
- `GET /api/milestones/delayed/all` - Get delayed milestones

### Financial Endpoints
- `GET /api/financial/expenses` - List expenses
- `POST /api/financial/expenses` - Create expense
- `GET /api/financial/invoices` - List invoices
- `POST /api/financial/invoices` - Create invoice
- `GET /api/financial/budget/:projectId` - Get budget analysis
- `GET /api/financial/summary` - Get financial summary

### Reports Endpoints
- `GET /api/reports/dashboard` - Get dashboard overview
- `GET /api/reports/project-status` - Project status report
- `GET /api/reports/resource-utilization` - Resource utilization report
- `GET /api/reports/financial-summary` - Financial summary report
- `GET /api/reports/milestone-slippage` - Milestone slippage report

## Project Structure

```
project-tracker/
├── docs/                    # Documentation
│   ├── BRD.md              # Business Requirements Document
│   ├── TSD.md              # Technical Specification Document
│   └── architecture.md     # System Architecture Documentation
├── src/
│   ├── backend/            # Backend application (Node.js/Express)
│   │   ├── src/
│   │   │   ├── routes/     # API route handlers
│   │   │   ├── middleware/ # Authentication middleware
│   │   │   ├── utils/      # Validation and utilities
│   │   │   ├── server.ts   # Express server setup
│   │   │   ├── seed.ts     # Database seeding
│   │   │   └── db.ts       # Database connection (SQLite wrapper)
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Database schema
│   │   │   └── dev.db      # SQLite database file
│   │   ├── .env            # Environment variables
│   │   └── package.json    # Backend dependencies
│   └── frontend/           # Frontend application (React)
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── pages/      # Page components
│       │   ├── hooks/      # React hooks
│       │   ├── services/   # API service layer
│       │   ├── types/      # TypeScript type definitions
│       │   └── App.tsx     # Main React component
│       └── package.json    # Frontend dependencies
├── tests/                  # Test files and documentation
│   └── README.md           # Testing strategy and guidelines
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # GitHub Actions CI/CD pipeline
├── deploy/
│   ├── azure-pipeline.yml  # Azure DevOps pipeline
│   └── docker-compose.yml  # Docker containerization
├── security/
│   ├── sast/
│   │   └── config.md       # Static Application Security Testing
│   └── secret-scanning/
│       └── config.md       # Secret detection configuration
├── setup.sh                # Database setup script
├── package.json            # Root package configuration
└── README.md               # This file
```

## Key Features Implementation

### Role-Based Access Control
The application implements role-based access with the following roles:
- **ADMIN** - Full system access
- **PROJECT_MANAGER** - Project and milestone management
- **RESOURCE_MANAGER** - Resource allocation and management
- **FINANCE_MANAGER** - Financial tracking and billing
- **EXECUTIVE** - Read-only dashboard and reports access

### Real-Time Monitoring
- Budget utilization tracking with alerts at 80% threshold
- Milestone slippage detection and reporting
- Resource overallocation warnings
- Overdue invoice notifications

### Integration Between Modules
- Automatic synchronization between project timelines and resource allocations
- Real-time financial updates as milestones are completed
- Billing milestone integration with invoice generation
- Consolidated reporting across all modules

## Development

### Running in Development Mode
```bash
# Start both frontend and backend
npm run dev

# Start only backend
npm run server:dev

# Start only frontend
npm run client:dev
```

### Building for Production
```bash
npm run build
```

### Database Operations
```bash
# Generate Prisma client (if available)
cd server && npm run db:generate

# Push schema changes
cd server && npm run db:push

# Seed database
cd server && npm run db:seed
```

## Environment Variables

### Server (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:3000"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.