# JavaScript CI Tools — Detailed Explanation

This document explains the main tools used in this JavaScript GitHub Actions CI example.

The JavaScript equivalents of the Python tools from the earlier example are:

| Python Tool | JavaScript Tool        | Purpose                                  |
| ----------- | ---------------------- | ---------------------------------------- |
| Flake8      | ESLint                 | Linting and code quality                 |
| Black       | Prettier               | Automatic code formatting                |
| Pytest      | Jest                   | Unit testing                             |
| pytest-cov  | Jest Coverage          | Test coverage                            |
| Bandit      | eslint-plugin-security | Static security checks/security hotspots |
| pip-audit   | npm audit              | Dependency vulnerability scanning        |

The CI pipeline also uses GitHub Actions for automation and Nodemailer for SMTP email notifications.

---

## 1. ESLint — JavaScript Linting and Code Quality

ESLint is a **static code analysis and linting tool for JavaScript**.

A simple way to explain it is:

> **ESLint asks: "Is this JavaScript code written cleanly and according to the rules of this project?"**

### What ESLint can detect

Depending on the configured rules, ESLint can detect:

- undefined variables
- unused variables
- suspicious equality checks
- inconsistent use of `var`, `let`, and `const`
- missing curly braces
- many common programming mistakes
- project-specific code-quality problems

### Example

Bad code:

```javascript
var total = 10;

if (total == "10") console.log("Matched");
```

Our ESLint configuration includes rules that prefer:

```javascript
const total = 10;

if (total === "10") {
  console.log("Matched");
}
```

The important ideas are:

- `const` is preferred when a value is not reassigned.
- `===` is safer and more predictable than `==`.
- curly braces make control flow clearer.

### Install ESLint

```bash
npm install --save-dev eslint
```

### Run ESLint

```bash
npx eslint src tests scripts
```

In this project, the npm script is:

```bash
npm run lint
```

### Configuration file

This project uses:

```text
eslint.config.js
```

Modern ESLint uses a **flat configuration** model.

The configuration defines:

- which files to scan
- which files to ignore
- JavaScript language settings
- allowed global variables
- linting rules

### Example rules

```javascript
rules: {
  "no-undef": "error",
  "no-unused-vars": "error",
  eqeqeq: ["error", "always"],
  curly: ["error", "all"],
  "no-var": "error",
  "prefer-const": "error",
}
```

### In GitHub Actions

```yaml
- name: ESLint code-quality check
  run: npm run lint
```

If ESLint finds a blocking error, it exits with a non-zero exit code and GitHub Actions marks the step as failed.

### Easy definition

> **ESLint is the JavaScript code reviewer in the CI pipeline.**

---

## 2. Prettier — Automatic JavaScript Formatter

Prettier is an **opinionated code formatter**.

Unlike ESLint, whose primary job is code quality and linting, Prettier focuses on making code formatting consistent.

A simple way to explain it is:

> **Prettier asks: "Is everyone formatting the code consistently?"**

### Example

Before Prettier:

```javascript
function add(a, b) {
  return a + b;
}
```

After Prettier:

```javascript
function add(a, b) {
  return a + b;
}
```

Prettier handles things such as:

- indentation
- spaces
- line wrapping
- commas
- semicolons
- quote style
- object formatting
- array formatting

### Install Prettier

```bash
npm install --save-dev prettier
```

### Automatically format the project

```bash
npm run format
```

This executes:

```bash
prettier --write .
```

The `--write` option modifies files.

### Check formatting without changing files

For CI, this project uses:

```bash
npm run format:check
```

which executes:

```bash
prettier --check .
```

This does not rewrite the code.

Instead, it checks whether the files are already correctly formatted.

### Configuration file

This project has:

```text
.prettierrc.json
```

Example:

```json
{
  "printWidth": 88,
  "singleQuote": false,
  "trailingComma": "all",
  "semi": true
}
```

### Meaning

`printWidth: 88`

Prettier generally tries to wrap long code around 88 characters.

`singleQuote: false`

Prefer double quotes in JavaScript.

`trailingComma: "all"`

Use trailing commas where supported.

`semi: true`

Add semicolons.

### `.prettierignore`

The file:

```text
.prettierignore
```

tells Prettier not to scan generated or dependency directories such as:

```text
node_modules/
coverage/
```

### In GitHub Actions

```yaml
- name: Prettier formatting check
  run: npm run format:check
```

### Easy definition

> **Prettier is the formatter that makes the team's JavaScript look consistent.**

---

## 3. Jest — JavaScript Unit Testing

Jest is a popular JavaScript testing framework.

A simple way to explain it is:

> **Jest asks: "Does the application behave the way we expect?"**

Suppose the application has:

```javascript
function add(a, b) {
  return a + b;
}
```

A Jest test can verify it:

```javascript
test("adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});
```

If the function returns `5`, the test passes.

If someone accidentally changes it to:

```javascript
function add(a, b) {
  return a - b;
}
```

the test fails.

### Run tests

```bash
npm test
```

### Test file

This example includes:

```text
tests/calculator.test.js
```

### Common Jest concepts

```javascript
describe("calculator", () => {
  test("adds numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

`describe()`

Groups related tests.

`test()`

Defines an individual test case.

`expect()`

Creates an assertion.

`toBe()`

Checks an exact value.

### Easy definition

> **Jest is the automated tester in the JavaScript CI pipeline.**

---

## 4. Jest Coverage — How Much Code Is Tested?

Passing tests do not necessarily mean that every important part of an application was tested.

Coverage measures how much application code is executed by tests.

This project has:

```text
jest.config.js
```

with:

```javascript
coverageThreshold: {
  global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
}
```

This means the project requires at least **90% coverage** across those measurements.

### Run with coverage

```bash
npm run test:coverage
```

### Coverage categories

**Statements**

How many executable statements were tested.

**Branches**

How many logical branches were tested.

Example:

```javascript
if (userIsAdmin) {
  // branch 1
} else {
  // branch 2
}
```

Good branch coverage normally requires exercising both paths.

**Functions**

How many functions were executed by tests.

**Lines**

How many source-code lines were executed.

### Coverage output

Jest creates:

```text
coverage/
```

including a browser-friendly HTML report.

The GitHub Actions workflow uploads this directory as an artifact.

### Easy definition

> **Coverage asks: "How much of our application code did our tests actually exercise?"**

---

## 5. eslint-plugin-security — JavaScript Security Scan

`eslint-plugin-security` adds security-oriented rules to ESLint.

It statically examines JavaScript source code for patterns that may represent a security risk or deserve review.

A simple way to explain it is:

> **eslint-plugin-security asks: "Does this JavaScript contain potentially dangerous security patterns?"**

It is best treated as a **security hotspot detector**, not proof that an application is secure. Some findings can be false positives and require human review.

### Examples of security patterns

The plugin can help identify patterns involving:

- unsafe regular expressions
- dynamic file-system access
- dynamic `require()`
- suspicious child-process usage
- object injection patterns
- other security-sensitive Node.js constructs

### Example: unsafe process execution

Potentially dangerous code:

```javascript
const { exec } = require("child_process");

exec(`ping ${userInput}`);
```

If `userInput` comes from an untrusted user, an attacker may attempt command injection.

Safer designs avoid passing untrusted text into a shell and validate input carefully.

### Security configuration file

This project uses:

```text
eslint.security.config.js
```

It loads:

```javascript
const security = require("eslint-plugin-security");
```

and applies:

```javascript
security.configs.recommended;
```

### Run the security scan

```bash
npm run security
```

which executes:

```bash
eslint -c eslint.security.config.js src scripts
```

### Meaning

`-c eslint.security.config.js`

Use the dedicated security configuration.

`src scripts`

Scan the application and CI helper scripts.

### In GitHub Actions

```yaml
- name: JavaScript security scan
  run: npm run security
```

### Easy definition

> **eslint-plugin-security is the security-focused JavaScript linter in the pipeline.**

---

## 6. npm audit — Dependency Vulnerability Scanning

Your project contains your own JavaScript code, but it also depends on third-party packages.

For example:

```text
nodemailer
jest
eslint
prettier
```

Those packages may themselves depend on other packages.

`npm audit` checks the dependency tree against known vulnerability information.

A simple way to explain it is:

> **npm audit asks: "Do any installed npm packages have known security vulnerabilities?"**

### Run it

```bash
npm audit
```

This project uses:

```bash
npm audit --audit-level=high
```

That makes high and critical vulnerabilities important CI failure conditions.

### Difference from eslint-plugin-security

```text
eslint-plugin-security
        |
        +--> Scans your JavaScript source code

npm audit
        |
        +--> Scans your npm dependency tree
```

They solve different security problems and are useful together.

---

## 7. `package.json` — Project Definition and Commands

`package.json` is one of the central files in a Node.js project.

It describes:

- project name
- version
- dependencies
- development dependencies
- Node.js requirements
- npm scripts

Example:

```json
"scripts": {
  "test": "jest --runInBand",
  "lint": "eslint src tests scripts",
  "format:check": "prettier --check .",
  "security": "eslint -c eslint.security.config.js src scripts"
}
```

This lets developers run simple commands:

```bash
npm test
npm run lint
npm run format:check
npm run security
```

instead of remembering long commands.

### `dependencies`

Packages required by the running application or helper code.

This project uses Nodemailer to send email.

### `devDependencies`

Packages mainly needed for development and CI.

Examples:

```text
Jest
ESLint
Prettier
eslint-plugin-security
```

### Easy definition

> **`package.json` is the project manifest and command center for a Node.js project.**

---

## 8. `package-lock.json` — Exact Dependency Lock

After you run:

```bash
npm install
```

npm normally creates:

```text
package-lock.json
```

`package.json` says which packages the project wants.

`package-lock.json` records the exact resolved dependency versions and dependency tree.

This ZIP intentionally does not include a generated lock file. The first successful
`npm install` will create one.

For a real repository, commit `package-lock.json` to Git. After that, change CI from:

```bash
npm install
```

to:

```bash
npm ci
```

`npm ci` installs exactly from the committed lock file and is designed for automated
CI environments.

Easy way to remember:

```text
package.json
    "What dependencies does my project need?"

package-lock.json
    "Exactly which dependency versions were resolved?"
```

---

## 9. `eslint.config.js`

This file defines the normal JavaScript code-quality rules.

Important rules in this project include:

```javascript
"no-undef": "error"
```

Do not use variables that have not been defined.

```javascript
"no-unused-vars": "error"
```

Do not leave unused variables in the code.

```javascript
eqeqeq: ["error", "always"];
```

Prefer:

```javascript
===
```

instead of:

```javascript
==
```

```javascript
"no-var": "error"
```

Prefer `let` or `const` instead of old-style `var`.

```javascript
"prefer-const": "error"
```

If a variable is never reassigned, use `const`.

---

## 10. `eslint.security.config.js`

This is a separate ESLint configuration focused on security.

Keeping it separate makes the CI pipeline easy to teach:

```text
ESLint
   |
   +--> General code quality

eslint-plugin-security
   |
   +--> Security-oriented static checks
```

This also produces two distinct GitHub Actions steps.

---

## 11. `.prettierrc.json`

This file stores the project's Prettier formatting rules.

Without a shared configuration, developers can format code differently.

With a shared configuration:

```text
Developer A
Developer B
Developer C
CI Server
```

all apply the same formatting rules.

---

## 12. `jest.config.js`

This file stores Jest configuration.

It controls:

- test environment
- test filenames
- which source files should be measured
- coverage output
- minimum coverage thresholds

In this project:

```javascript
testEnvironment: "node";
```

means tests run as Node.js tests rather than browser tests.

```javascript
collectCoverageFrom: ["src/**/*.js"];
```

means measure application files under `src/`.

---

## 13. Nodemailer — CI Email Notifications

Nodemailer is used by:

```text
scripts/send-ci-email.js
```

to send an email over SMTP.

The script does not contain the real SMTP password.

Instead, GitHub Actions injects secrets as environment variables.

Required secrets:

```text
SMTP_SERVER
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
CI_EMAIL_RECIPIENT
```

Example GitHub Actions configuration:

```yaml
env:
  SMTP_SERVER: ${{ secrets.SMTP_SERVER }}
  SMTP_PORT: ${{ secrets.SMTP_PORT }}
  SMTP_USERNAME: ${{ secrets.SMTP_USERNAME }}
  SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
  CI_EMAIL_RECIPIENT: ${{ secrets.CI_EMAIL_RECIPIENT }}
```

### Why use secrets?

Never do this:

```javascript
const password = "my-real-password";
```

and never put passwords directly in `ci.yml`.

GitHub Secrets keep sensitive configuration separate from source code.

---

## 14. The Complete CI Flow

```text
Developer Push / Pull Request
              |
              v
        GitHub Actions
              |
              v
      Checkout Repository
              |
              v
       Set Up Node.js
              |
              v
          npm ci
              |
              v
           ESLint
      Code Quality Check
              |
              v
          Prettier
       Formatting Check
              |
              v
            Jest
       Unit Tests + Coverage
              |
              v
 eslint-plugin-security
        Security Scan
              |
              v
         npm audit
    Dependency Security
              |
              v
    Upload Coverage Artifact
              |
              v
        Email Result
```

---

## 15. Easy Way to Remember the Tools

### ESLint — The Code Reviewer

> "Is this JavaScript clean and following our coding rules?"

### Prettier — The Formatter

> "Does everyone's code look consistent?"

### Jest — The Tester

> "Does the code actually work?"

### Jest Coverage — The Coverage Inspector

> "How much of the code did we test?"

### eslint-plugin-security — The Security Reviewer

> "Does the source code contain suspicious security patterns?"

### npm audit — The Dependency Security Inspector

> "Do our third-party packages have known vulnerabilities?"

### GitHub Actions — The Automation Engine

> "Run all of these checks automatically on every important code change."

### Nodemailer — The Notification System

> "Tell the team whether the pipeline passed or failed."

---

## 16. Important Security Note

Passing all automated checks does **not** prove that an application is completely secure.

These tools are quality gates.

A larger production security program can also include:

- GitHub secret scanning
- CodeQL or another SAST platform
- container image scanning
- software composition analysis
- DAST
- infrastructure-as-code scanning
- peer code review
- threat modeling
- penetration testing
- runtime monitoring

The purpose of this example is to show how several useful checks can be automated in a straightforward CI pipeline.
