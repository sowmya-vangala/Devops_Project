# Cloud-Native DevSecOps Appointment Booking System

A secure, cloud-native dynamic web application designed for appointment scheduling, built with a FastAPI backend, React frontend, automated CI/CD pipelines, and integrated security gates.

---

## Architecture & Tech Stack

- **Frontend:** React.js, Axios, React Router, CSS Modules
- **Backend:** Python (FastAPI), Pydantic (data validation), SQLAlchemy
- **Database:** SQLite / PostgreSQL
- **Security & Quality (SAST & DAST):** SonarCloud / SonarQube, OWASP ZAP
- **Automation & CI/CD:** GitHub Actions
- **Web Server & Reverse Proxy:** Nginx

---

## Core Features

- **Full CRUD Support:** End-to-end appointment scheduling, updating, viewing, and cancellation.
- **Provider Management:** Create and view healthcare/service provider profiles.
- **Dynamic Validation:** Client-side validation and server-side request schema enforcement via Pydantic.
- **Authentication & Authorization:** Secure token-based user authentication.
- **Automated DevSecOps Pipeline:** Automated testing, code quality checks, static security scanning, and containerized deployment triggers on commit.

---

## CI/CD Pipeline & Security Workflow

1. **Continuous Integration (CI):**
   - **Linting & Code Quality:** Code standards checked using SonarCloud/SonarQube.
   - **Automated Testing:** Pytest unit and integration test suites run automatically against backend services.
   - **Security Analysis (SAST):** Automated vulnerability scans integrated into the pull request and push events.
2. **Dynamic Application Security Testing (DAST):**
   - Vulnerability detection executed against deployed endpoints using OWASP ZAP rules.
3. **Continuous Deployment (CD):**
   - Automated deployment pipeline stages configured to build artifacts and deploy services directly to public cloud infrastructure via Nginx reverse proxy.

---

## Project Structure

```text
├── .github/
│   └── workflows/
│       ├── ci-cd.yml               # Automated CI/CD and testing pipeline
│       └── setup-infrastructure.yml # Cloud infrastructure setup workflow
├── .zap/
│   └── rules.tsv                  # OWASP ZAP security scan rules
├── backend/
│   ├── app/
│   │   ├── routers/               # API endpoints (appointments, auth, providers)
│   │   ├── config.py              # Application settings
│   │   ├── database.py            # DB engine and session configuration
│   │   ├── models.py              # Database ORM models
│   │   └── schemas.py             # Pydantic schemas for data validation
│   └── tests/                     # Automated Pytest test suites
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable React UI components
│   │   ├── pages/                 # Route pages (Dashboard, Booking, Login, etc.)
│   │   └── api/                   # API client configuration
│   └── package.json
├── docs/
│   └── nginx.conf                 # Production Nginx reverse proxy configuration
└── sonar-project.properties       # SonarQube / SonarCloud project configuration
