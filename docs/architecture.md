# Project Tracker Application Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PROJECT TRACKER APPLICATION                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   FRONTEND      │◄───────►│   BACKEND API   │◄───────►│    DATABASE     │
│   (React App)   │         │  (Express.js)   │         │   (SQLite/PG)   │
│                 │         │                 │         │                 │
│  Port: 3000     │         │  Port: 3001     │         │                 │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        │                           │                           │
        ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  UI Components  │         │   API Routes    │         │   Data Models   │
│                 │         │                 │         │                 │
│ • Dashboard     │         │ • Authentication│         │ • Users         │
│ • Projects      │         │ • Projects      │         │ • Projects      │
│ • Resources     │         │ • Resources     │         │ • Resources     │
│ • Milestones    │         │ • Milestones    │         │ • Milestones    │
│ • Financial     │         │ • Financial     │         │ • Expenses      │
│ • Reports       │         │ • Reports       │         │ • Invoices      │
│                 │         │                 │         │ • Allocations   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Module Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS LOGIC MODULES                            │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│  PROJECT        │  RESOURCE       │  MILESTONE      │  FINANCIAL          │
│  MANAGEMENT     │  MANAGEMENT     │  MANAGEMENT     │  TRACKING           │
│                 │                 │                 │                     │
│ • Create/Edit   │ • Resource      │ • Define        │ • Budget            │
│ • Archive       │   Profiles      │   Milestones    │   Management        │
│ • PO Details    │ • Cost Details  │ • Track         │ • Expense           │
│ • Timeline      │ • Experience    │   Progress      │   Tracking          │
│ • Budget        │ • Skills        │ • Billing       │ • Invoice           │
│ • Status        │ • Allocation    │   Milestones    │   Generation        │
│                 │ • Utilization   │ • Status        │ • Payment           │
│                 │                 │   Indicators    │   Tracking          │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONITORING & REPORTING                              │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│  DASHBOARD      │  PROJECT        │  RESOURCE       │  FINANCIAL          │
│  OVERVIEW       │  REPORTS        │  REPORTS        │  REPORTS            │
│                 │                 │                 │                     │
│ • Key Metrics   │ • Status        │ • Utilization   │ • Budget vs         │
│ • Alerts        │ • Timeline      │ • Allocation    │   Actual            │
│ • Health        │ • Milestones    │ • Availability  │ • Revenue           │
│   Indicators    │ • Progress      │ • Performance   │ • Profitability     │
│ • Quick Actions │ • Slippage      │ • Cost Analysis │ • Invoice Status    │
│                 │                 │                 │ • Payment Overdue   │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────┐
│   USER INPUT    │
│                 │
│ • Login         │
│ • Create        │
│ • Update        │
│ • Delete        │
└─────────────────┘
        │
        ▼
┌─────────────────┐         ┌─────────────────┐
│  AUTHENTICATION │         │   VALIDATION    │
│                 │◄───────►│                 │
│ • JWT Tokens    │         │ • Input         │
│ • Role Check    │         │   Sanitization  │
│ • Permissions   │         │ • Business      │
│                 │         │   Rules         │
└─────────────────┘         └─────────────────┘
        │                           │
        ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  BUSINESS       │         │   DATABASE      │
│  LOGIC          │◄───────►│   OPERATIONS    │
│                 │         │                 │
│ • Data          │         │ • CRUD          │
│   Processing    │         │ • Transactions  │
│ • Calculations  │         │ • Relationships │
│ • Integrations  │         │ • Constraints   │
└─────────────────┘         └─────────────────┘
        │
        ▼
┌─────────────────┐
│   RESPONSE      │
│                 │
│ • JSON Data     │
│ • Status Codes  │
│ • Error         │
│   Messages      │
└─────────────────┘
```

## Security Architecture

```
┌─────────────────┐
│   CLIENT        │
│   (Browser)     │
└─────────────────┘
        │
        │ HTTPS
        ▼
┌─────────────────┐
│  LOAD BALANCER  │
│  + WAF          │
└─────────────────┘
        │
        ▼
┌─────────────────┐         ┌─────────────────┐
│  API GATEWAY    │         │  RATE LIMITING  │
│                 │◄───────►│                 │
│ • CORS          │         │ • IP-based      │
│ • Headers       │         │ • Route-based   │
│ • Validation    │         │ • User-based    │
└─────────────────┘         └─────────────────┘
        │
        ▼
┌─────────────────┐         ┌─────────────────┐
│  AUTHENTICATION │         │  AUTHORIZATION  │
│                 │◄───────►│                 │
│ • JWT Tokens    │         │ • RBAC          │
│ • Token         │         │ • Permissions   │
│   Validation    │         │ • Resource      │
│                 │         │   Access        │
└─────────────────┘         └─────────────────┘
        │
        ▼
┌─────────────────┐
│  APPLICATION    │
│  LOGIC          │
│                 │
│ • Business      │
│   Rules         │
│ • Data          │
│   Processing    │
└─────────────────┘
```

## Deployment Architecture

### Development Environment
```
┌─────────────────┐
│  DEVELOPER      │
│  MACHINE        │
│                 │
│ ┌─────────────┐ │
│ │  Frontend   │ │
│ │  :3000      │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │  Backend    │ │
│ │  :3001      │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │  SQLite DB  │ │
│ │  File       │ │
│ └─────────────┘ │
└─────────────────┘
```

### Production Environment (Planned)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  AZURE LOAD     │    │  CONTAINER      │    │  AZURE          │
│  BALANCER       │    │  INSTANCES      │    │  POSTGRESQL     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  WAF        │ │    │ │  Frontend   │ │    │ │  Primary    │ │
│ │  Protection │ │    │ │  (Nginx)    │ │    │ │  Database   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│                 │    │ │  Backend    │ │    │ │  Read       │ │
│                 │    │ │  (Node.js)  │ │    │ │  Replica    │ │
│                 │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                 │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│  React 18       │  TypeScript     │  Vite           │  Tailwind CSS       │
│  Component      │  Type Safety    │  Build Tool     │  Styling            │
│  Framework      │  & Tooling      │  & Dev Server   │  Framework          │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                                  │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│  Node.js        │  Express.js     │  TypeScript     │  JWT Auth           │
│  Runtime        │  Web Framework  │  Language       │  Security           │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE LAYER                                 │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│  SQLite         │  Prisma ORM     │  Database       │  Migration          │
│  Database       │  (when working) │  Schema         │  Scripts            │
│  Engine         │                 │  Management     │                     │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            DEVOPS & SECURITY                                │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│  Docker         │  Azure          │  GitHub         │  Security           │
│  Containerization│ Cloud Platform │  CI/CD          │  Scanning           │
│  (Planned)      │  (Planned)      │  Actions        │  Tools              │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘
```