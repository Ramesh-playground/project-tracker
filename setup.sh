#!/bin/bash

echo "🚀 Setting up Project Tracker application..."

# Create the database directory
mkdir -p /home/runner/work/project-tracker/project-tracker/src/backend/prisma

# Create a simple SQLite database with basic structure
sqlite3 /home/runner/work/project-tracker/project-tracker/src/backend/prisma/dev.db << 'EOF'
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'PROJECT_MANAGER',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Projects table  
CREATE TABLE IF NOT EXISTS projects (
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
    status TEXT NOT NULL DEFAULT 'PLANNED',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdBy TEXT NOT NULL,
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Insert demo admin user
INSERT OR IGNORE INTO users (id, email, name, password, role, createdAt, updatedAt) 
VALUES (
    'demo-admin-id', 
    'admin@demo.com', 
    'Admin User', 
    '$2a$10$40ADOqlE7ZkA0GtkJnqrneuigwU5G2kvEI5FiVoheSme9zFMzDhyO', 
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert demo project manager user
INSERT OR IGNORE INTO users (id, email, name, password, role, createdAt, updatedAt) 
VALUES (
    'demo-pm-id', 
    'pm@demo.com', 
    'Project Manager', 
    '$2a$10$40ADOqlE7ZkA0GtkJnqrneuigwU5G2kvEI5FiVoheSme9zFMzDhyO', 
    'PROJECT_MANAGER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert demo project
INSERT OR IGNORE INTO projects (id, name, projectId, description, poNumber, poDate, poAmount, clientName, startDate, endDate, budget, status, createdAt, updatedAt, createdBy)
VALUES (
    'demo-project-id',
    'E-commerce Platform Development',
    'PROJ-2024-001',
    'Development of a modern e-commerce platform with advanced features',
    'PO-2024-E001',
    '2024-01-15',
    150000,
    'TechCorp Inc.',
    '2024-02-01',
    '2024-08-31',
    105000,
    'IN_PROGRESS',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'demo-pm-id'
);

EOF

echo "✅ Database created with demo data"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@demo.com / password"
echo "  PM: pm@demo.com / password"
echo ""
echo "🎉 Setup complete!"