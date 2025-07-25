# SAST (Static Application Security Testing) Configuration

## Tools and Rules

### 1. ESLint Security Rules
Configuration for JavaScript/TypeScript security linting.

**Rules enabled:**
- no-eval
- no-implied-eval  
- no-new-func
- no-script-url
- security/detect-object-injection
- security/detect-non-literal-fs-filename
- security/detect-non-literal-regexp
- security/detect-non-literal-require
- security/detect-possible-timing-attacks
- security/detect-pseudoRandomBytes
- security/detect-unsafe-regex

### 2. Semgrep Configuration
Static analysis rules for security vulnerabilities.

**Rule sets:**
- javascript.lang.security
- typescript.lang.security
- react.lang.security
- sql-injection
- xss
- path-traversal
- command-injection

### 3. CodeQL Configuration
GitHub's semantic code analysis.

**Languages:** JavaScript, TypeScript
**Queries:** security-and-quality

### 4. Bandit (for Python scripts if any)
Security linter for Python code.

### 5. Custom Security Rules

**Authentication & Authorization:**
- Verify JWT secret length (minimum 32 characters)
- Check for hardcoded credentials
- Validate role-based access control implementation

**Input Validation:**
- Ensure all user inputs are validated
- Check for SQL injection vulnerabilities
- Verify XSS protection

**Data Protection:**
- Check for sensitive data in logs
- Verify encryption of sensitive data
- Validate secure cookie settings

**API Security:**
- Verify CORS configuration
- Check rate limiting implementation
- Validate HTTPS enforcement

## Excluded Files
- node_modules/
- dist/
- build/
- coverage/
- *.min.js
- *.test.js
- *.spec.js

## Scan Schedule
- On every pull request
- Daily scheduled scans
- Before deployment to production

## Severity Levels
- **Critical:** Immediate action required
- **High:** Fix within 24 hours
- **Medium:** Fix within 1 week
- **Low:** Fix within 2 weeks
- **Info:** Optional improvements