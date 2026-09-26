# JavaScript GitHub Actions CI + Email Notification Lab

This repository is a complete educational JavaScript CI example.

It demonstrates how a developer can push JavaScript code to GitHub and automatically run:

- ESLint code-quality checks
- Prettier formatting validation
- Jest unit tests
- Jest coverage with a 90% threshold
- `eslint-plugin-security` static security checks
- `npm audit` dependency vulnerability scanning
- GitHub Actions coverage artifact upload
- success/failure email notification through SMTP

---

# Project Structure

```text
javascript-github-actions-ci-email/
├── .github/
│   └── workflows/
│       └── ci.yml
├── scripts/
│   └── send-ci-email.js
├── src/
│   └── calculator.js
├── tests/
│   └── calculator.test.js
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── eslint.config.js
├── eslint.security.config.js
├── jest.config.js
├── package.json
├── EXPLANATION.md
└── README.md
```

---

# 1. Requirements

Install Node.js and npm.

Check:

```bash
node --version
npm --version
```

The GitHub Actions workflow uses Node.js 24.

The example is configured for Node.js 22 or newer.

---

# 2. Install Dependencies

From the project directory:

```bash
npm install
```

This educational ZIP does not include a generated `package-lock.json`.

After the first successful install, npm will create `package-lock.json`. Commit that
file to Git for reproducible dependency installs.

Once `package-lock.json` is committed, you can change the CI install command from:

```bash
npm install
```

to:

```bash
npm ci
```

`npm ci` is the preferred choice for a mature CI pipeline with a committed lock file.

---

# 3. Run the Application Tests

```bash
npm test
```

This runs Jest.

Expected result:

```text
PASS tests/calculator.test.js
```

---

# 4. Run Tests With Coverage

```bash
npm run test:coverage
```

Jest generates:

```text
coverage/
```

and enforces at least 90% global coverage for:

- statements
- branches
- functions
- lines

Open:

```text
coverage/lcov-report/index.html
```

in a browser to inspect the HTML coverage report.

---

# 5. Run ESLint

```bash
npm run lint
```

ESLint checks:

```text
src/
tests/
scripts/
```

for code-quality issues.

The rules are stored in:

```text
eslint.config.js
```

---

# 6. Run Prettier

Check formatting:

```bash
npm run format:check
```

Automatically fix formatting:

```bash
npm run format
```

Configuration:

```text
.prettierrc.json
```

Ignored paths:

```text
.prettierignore
```

---

# 7. Run the JavaScript Security Scan

```bash
npm run security
```

This uses `eslint-plugin-security` with:

```text
eslint.security.config.js
```

It scans:

```text
src/
scripts/
```

for security-sensitive JavaScript patterns.

---

# 8. Run Dependency Vulnerability Scanning

```bash
npm audit
```

The CI workflow uses:

```bash
npm audit --audit-level=high
```

This makes high or critical dependency findings blocking conditions.

---

# 9. Run All CI Checks Locally

Use:

```bash
npm run ci:local
```

This executes:

```text
ESLint
   ↓
Prettier check
   ↓
Jest + coverage
   ↓
Security lint
   ↓
npm audit
```

This is useful before pushing code to GitHub.

---

# 10. GitHub Actions Workflow

The workflow is:

```text
.github/workflows/ci.yml
```

Complete code:

```yaml
name: JavaScript CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  ci:
    runs-on: ubuntu-latest

    permissions:
      contents: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: npm

      - name: Install dependencies
        run: npm install

      - name: ESLint code-quality check
        run: npm run lint

      - name: Prettier formatting check
        run: npm run format:check

      - name: Jest unit tests with coverage
        run: npm run test:coverage

      - name: JavaScript security scan
        run: npm run security

      - name: Dependency vulnerability scan
        run: npm audit --audit-level=high

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: jest-coverage-report
          path: coverage/
          if-no-files-found: ignore

      - name: Send CI email
        if: always()
        continue-on-error: true
        env:
          SMTP_SERVER: ${{ secrets.SMTP_SERVER }}
          SMTP_PORT: ${{ secrets.SMTP_PORT }}
          SMTP_USERNAME: ${{ secrets.SMTP_USERNAME }}
          SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
          CI_EMAIL_RECIPIENT: ${{ secrets.CI_EMAIL_RECIPIENT }}
          CI_STATUS: ${{ job.status }}
        run: node scripts/send-ci-email.js
```

---

# 11. `name: JavaScript CI`

```yaml
name: JavaScript CI
```

This gives the workflow a readable name in the GitHub Actions interface.

---

# 12. Workflow Triggers

```yaml
on:
  push:
    branches:
      - main
```

Runs when code is pushed to `main`.

```yaml
pull_request:
  branches:
    - main
```

Runs when a Pull Request targets `main`.

```yaml
workflow_dispatch:
```

Adds a manual **Run workflow** button in GitHub.

---

# 13. Job and Runner

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
```

This creates a GitHub-hosted Ubuntu runner for the CI job.

Conceptually:

```text
GitHub
   ↓
Temporary Ubuntu Runner
   ↓
Run CI
   ↓
Runner is discarded
```

---

# 14. Permissions

```yaml
permissions:
  contents: read
```

The workflow only needs to read the repository.

This follows the security principle of least privilege.

---

# 15. Checkout the Repository

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

This makes your project files available on the GitHub Actions runner.

Without checkout, later commands would not have your source code.

---

# 16. Set Up Node.js

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "24"
    cache: npm
```

This configures Node.js 24.

```yaml
cache: npm
```

enables npm caching to make later workflow runs faster.

---

# 17. Install Dependencies

```yaml
- name: Install dependencies
  run: npm install
```

This sample uses `npm install` because the ZIP does not ship a generated
`package-lock.json`.

On the first install, npm creates:

```text
package-lock.json
```

For a production repository, commit that lock file and then change the workflow to:

```yaml
- name: Install dependencies
  run: npm ci
```

`npm ci` is preferred in mature CI pipelines because it installs exactly from the
committed lock file.

---

# 18. ESLint Step

```yaml
- name: ESLint code-quality check
  run: npm run lint
```

This runs:

```bash
eslint src tests scripts
```

If blocking lint errors are found, ESLint exits non-zero and the job fails.

---

# 19. Prettier Step

```yaml
- name: Prettier formatting check
  run: npm run format:check
```

This runs:

```bash
prettier --check .
```

It checks formatting without modifying files.

Locally, developers can fix formatting with:

```bash
npm run format
```

---

# 20. Jest Tests and Coverage

```yaml
- name: Jest unit tests with coverage
  run: npm run test:coverage
```

This runs the unit tests and generates a coverage report.

The project requires at least 90% coverage.

If coverage falls below the configured threshold, Jest exits with a failure code.

---

# 21. Security Scan

```yaml
- name: JavaScript security scan
  run: npm run security
```

This loads:

```text
eslint.security.config.js
```

and applies `eslint-plugin-security`.

It checks source code for potentially risky JavaScript patterns.

---

# 22. npm Audit

```yaml
- name: Dependency vulnerability scan
  run: npm audit --audit-level=high
```

This scans the installed dependency tree for known vulnerabilities.

The important distinction is:

```text
eslint-plugin-security
    scans application source code

npm audit
    scans third-party dependencies
```

---

# 23. Upload the Coverage Artifact

```yaml
- name: Upload coverage report
  if: always()
  uses: actions/upload-artifact@v4
```

The workflow uploads:

```text
coverage/
```

as:

```text
jest-coverage-report
```

You can download the report from the GitHub Actions run page.

---

# 24. Why `if: always()`?

Normally, later steps may be skipped when an earlier step fails.

For example:

```text
ESLint     PASS
Prettier   PASS
Jest       FAIL
Security   SKIPPED
```

A notification step needs to execute even when CI fails.

Therefore:

```yaml
if: always()
```

means:

> Attempt to run this step regardless of whether earlier steps passed or failed.

It is used for:

- coverage artifact upload
- email notification

---

# 25. Email Notification

```yaml
- name: Send CI email
  if: always()
```

The script:

```text
scripts/send-ci-email.js
```

uses Nodemailer to send an SMTP email.

The email includes:

- CI status
- repository
- workflow
- branch
- commit
- triggering user
- direct link to the GitHub Actions run

The subject is similar to:

```text
✅ JavaScript CI Passed — owner/repository
```

or:

```text
❌ JavaScript CI Failed — owner/repository
```

---

# 26. GitHub Secrets Required

Go to:

```text
GitHub Repository
   ↓
Settings
   ↓
Secrets and variables
   ↓
Actions
   ↓
New repository secret
```

Create:

```text
SMTP_SERVER
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
CI_EMAIL_RECIPIENT
```

For Gmail, an example is:

```text
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=<Google App Password>
CI_EMAIL_RECIPIENT=team@example.com
```

Do not put the real SMTP password directly in source code or YAML.

---

# 27. `continue-on-error: true`

The notification step has:

```yaml
continue-on-error: true
```

Why?

Suppose:

```text
ESLint       PASS
Prettier     PASS
Jest         PASS
Security     PASS
npm audit    PASS
Email SMTP   FAIL
```

The application CI checks were successful.

A temporary email server problem should not normally redefine good application code as bad application code.

Therefore, the notification step is allowed to fail without replacing the CI result caused by the main quality checks.

---

# 28. How GitHub Actions Detects Failure

Command-line programs return exit codes.

Conventionally:

```text
Exit code 0
    =
Success
```

```text
Non-zero exit code
    =
Failure
```

GitHub Actions uses these codes.

Example:

```text
npm run lint
     |
     +--> Exit 0      → Step passes
     |
     +--> Exit != 0   → Step fails
```

The same idea applies to:

```text
Prettier
Jest
eslint-plugin-security
npm audit
```

---

# 29. Demonstrate a Failed Test

Open:

```text
tests/calculator.test.js
```

Change:

```javascript
expect(add(2, 3)).toBe(5);
```

to:

```javascript
expect(add(2, 3)).toBe(100);
```

Run:

```bash
npm test
```

Jest should fail.

If pushed to GitHub, CI should fail and the email notification should report a failed workflow.

Restore:

```javascript
expect(add(2, 3)).toBe(5);
```

and rerun.

---

# 30. Demonstrate a Prettier Failure

Temporarily add badly formatted code such as:

```javascript
function hello(name) {
  return "Hello " + name;
}
```

Run:

```bash
npm run format:check
```

It should report formatting problems.

Fix automatically:

```bash
npm run format
```

Then:

```bash
npm run format:check
```

should pass.

---

# 31. Demonstrate an ESLint Failure

Try:

```javascript
function example() {
  var message = "hello";

  if (message == "hello") {
    return true;
  }

  return false;
}
```

The configured rules can complain about:

- `var`
- non-strict equality

Prefer:

```javascript
function example() {
  const message = "hello";

  if (message === "hello") {
    return true;
  }

  return false;
}
```

---

# 32. CI Pipeline Summary

```text
Git Push / Pull Request
         |
         v
    GitHub Actions
         |
         v
       ESLint
     Code Quality
         |
         v
      Prettier
      Formatting
         |
         v
        Jest
   Tests + Coverage
         |
         v
eslint-plugin-security
    Source Security
         |
         v
     npm audit
 Dependency Security
         |
         v
 Coverage Artifact
         |
         v
 Email Notification
```

---

# 33. CI vs CD

This repository primarily demonstrates **Continuous Integration (CI)**.

CI verifies changes automatically.

```text
Code Change
   ↓
Lint
   ↓
Format Check
   ↓
Test
   ↓
Security Checks
```

A later Continuous Delivery/Deployment pipeline could continue:

```text
CI Passes
   ↓
Build Application
   ↓
Build Docker Image
   ↓
Push Image
   ↓
Deploy to Dev
   ↓
Approval
   ↓
Deploy to Production
```

This project is therefore a strong foundation for a larger CI/CD lab.

---

# 34. Read `EXPLANATION.md`

For a deeper explanation of each tool, read:

```text
EXPLANATION.md
```

It explains ESLint, Prettier, Jest, coverage, `eslint-plugin-security`, `npm audit`, `package.json`, `package-lock.json`, and the email notification architecture.
