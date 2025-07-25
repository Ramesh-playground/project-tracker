# Secret Scanning Configuration

## Overview
Configuration for detecting and preventing secrets in the codebase.

## Tools and Detection

### 1. GitHub Secret Scanning
Automatically enabled for public repositories to detect:
- API keys
- Access tokens
- Passwords
- Private keys
- Database connection strings

### 2. TruffleHog
Local secret scanning tool configuration.

**Detection patterns:**
- AWS keys
- Google API keys
- GitHub tokens
- Database URLs
- JWT secrets
- Private SSH keys
- SSL certificates

### 3. GitLeaks
Git repository secret scanner.

**Configuration:**
```toml
[[rules]]
description = "AWS Access Key"
regex = '''AKIA[0-9A-Z]{16}'''
tags = ["key", "AWS"]

[[rules]]
description = "AWS Secret Key"
regex = '''[0-9a-zA-Z/+]{40}'''
tags = ["key", "AWS"]

[[rules]]
description = "Generic API Key"
regex = '''(?i)api[_-]?key['\s]*[:=]['\s]*[0-9a-z\-_]{10,}'''
tags = ["key", "API"]

[[rules]]
description = "Database URL"
regex = '''(?i)(postgres|mysql|mongodb)://[^\s'"]{10,}'''
tags = ["database", "url"]

[[rules]]
description = "JWT Secret"
regex = '''(?i)jwt[_-]?secret['\s]*[:=]['\s]*[0-9a-z\-_]{10,}'''
tags = ["jwt", "secret"]
```

## Allowed Secrets (False Positives)
Files and patterns that are allowed:

### Environment Templates
- `.env.example`
- `.env.template`
- `config.example.js`

### Test Data
- `test/fixtures/`
- `*.test.ts` (with dummy keys)
- `*.spec.ts` (with dummy keys)

### Documentation
- `README.md` (example configurations)
- `docs/` (sample configurations)

## Secret Handling Best Practices

### 1. Environment Variables
All secrets should be stored in environment variables:
```bash
# Good
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}

# Bad
DATABASE_URL="postgresql://user:password@localhost/db"
JWT_SECRET="hardcoded-secret-key"
```

### 2. Configuration Files
Use configuration files with environment variable substitution:
```javascript
const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    secret: process.env.JWT_SECRET,
  }
};
```

### 3. Secure Development
- Never commit `.env` files
- Use `.env.example` with dummy values
- Rotate secrets regularly
- Use different secrets for different environments

## Incident Response

### When a Secret is Detected:
1. **Immediate:** Remove secret from repository history
2. **Within 1 hour:** Rotate the exposed secret
3. **Within 4 hours:** Update all dependent systems
4. **Within 24 hours:** Complete incident report

### Remediation Steps:
1. Remove secret from current codebase
2. Remove from git history using `git filter-branch` or BFG
3. Force push to remove from remote repository
4. Generate new secret
5. Update all environments with new secret
6. Verify all systems are working

## Monitoring and Alerts

### Real-time Scanning:
- Pre-commit hooks
- CI/CD pipeline checks
- Webhook notifications

### Scheduled Scanning:
- Daily full repository scans
- Weekly dependency scans
- Monthly security reviews

### Alert Channels:
- Email notifications
- Slack integration
- Security team dashboard
- Incident management system

## Exclusions
Paths excluded from secret scanning:
- `node_modules/`
- `dist/`
- `build/`
- `coverage/`
- `*.log`
- `*.min.js`
- `.git/`