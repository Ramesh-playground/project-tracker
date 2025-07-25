# Test Documentation

## Testing Strategy

This project uses a comprehensive testing approach including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── unit/
│   ├── backend/
│   │   ├── auth.test.js
│   │   ├── projects.test.js
│   │   ├── resources.test.js
│   │   └── milestones.test.js
│   └── frontend/
│       ├── components/
│       ├── hooks/
│       └── utils/
├── integration/
│   ├── api/
│   │   ├── auth-flow.test.js
│   │   └── project-management.test.js
│   └── database/
│       └── schema.test.js
├── e2e/
│   ├── user-flows/
│   │   ├── login.test.js
│   │   ├── project-creation.test.js
│   │   └── resource-allocation.test.js
│   └── scenarios/
│       └── complete-project-lifecycle.test.js
└── fixtures/
    ├── users.json
    ├── projects.json
    └── resources.json
```

## Testing Tools

### Backend Testing
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **Jest-Environment-Node** - Node.js test environment

### Frontend Testing  
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **MSW** - API mocking

### E2E Testing
- **Playwright** - Browser automation
- **Cypress** - Alternative E2E framework

## Test Configuration

### Backend Tests
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
  ],
};
```

### Frontend Tests
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
```

## Test Categories

### Unit Tests
- Component rendering
- Function logic
- API route handlers
- Database operations
- Authentication logic

### Integration Tests
- API endpoint flows
- Database transactions
- Authentication flows
- Module interactions

### E2E Tests
- Complete user workflows
- Cross-browser compatibility
- Performance testing
- Accessibility testing

## Running Tests

```bash
# All tests
npm test

# Backend tests only
npm run server:test

# Frontend tests only  
npm run client:test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## Test Data Management

### Fixtures
Standardized test data for consistent testing:
- User accounts with different roles
- Sample projects with various statuses
- Resource profiles and allocations
- Milestone and financial data

### Database Seeding
Test database setup and teardown:
```javascript
beforeEach(async () => {
  await setupTestDatabase();
  await seedTestData();
});

afterEach(async () => {
  await cleanupTestDatabase();
});
```

## Continuous Integration

Tests are automatically run:
- On every pull request
- Before deployment
- On scheduled basis (nightly)

### Coverage Requirements
- Minimum 80% code coverage
- 100% coverage for critical paths
- All new features must include tests

## Test Environment

### Environment Variables
```bash
NODE_ENV=test
DATABASE_URL=sqlite::memory:
JWT_SECRET=test-secret-key
```

### Mock Services
- Email service mocking
- External API mocking
- File system mocking
- Time/date mocking

## Best Practices

1. **Test Isolation** - Each test should be independent
2. **Clear Naming** - Descriptive test names
3. **AAA Pattern** - Arrange, Act, Assert
4. **Mock External Dependencies** - Don't rely on external services
5. **Test Edge Cases** - Include error scenarios
6. **Performance Testing** - Monitor test execution time
7. **Regular Maintenance** - Keep tests up to date