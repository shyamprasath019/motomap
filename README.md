# Motomap 🏍️

> **India's first interactive motorcycle knowledge and diagnostic platform.**  
> Community-contributed, expert-reviewed content, and AI-powered vision diagnostics. Built specifically for India's two-wheeler ecosystem (Hero, Bajaj, TVS, Royal Enfield, KTM).

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Architecture at a Glance](#-architecture-at-a-glance)
4. [Tech Stack](#-tech-stack)
5. [Getting Started](#%EF%B8%8F-getting-started)
   - [Prerequisites](#prerequisites)
   - [Backend API Setup](#1-backend-api-motomap-api)
   - [Contributor Portal Setup](#2-contributor-portal-motomap-contributor)
   - [Rider Mobile App Setup](#3-rider-mobile-app-motomap-app)
   - [Running with Docker](#running-with-docker)
6. [Core Domain Concepts](#-core-domain-concepts)
7. [Safety-Critical Rules](#-safety-critical-rules)
8. [Project Structure](#%EF%B8%8F-project-structure)
9. [Contributing](#-contributing)

---

## 🌟 Overview

Motomap is a comprehensive digital twin and diagnostic platform for motorcycles. It empowers riders with:
1. **Interactive Anatomy Maps**: Visualizing bike parts, connection graphs, and functional dependencies.
2. **AI-Powered Diagnostics**: Uploading photos of issues (e.g. oil leaks, worn brake pads) for real-time risk assessment and step-by-step DIY fixes.
3. **Verified Knowledge Base**: Community-driven, expert-reviewed maintenance manuals and diagnostic steps.

---

## ✨ Key Features

- **Snap & Diagnose (AI Vision)**: Utilizes Claude 3.5 Sonnet Vision APIs to scan visual motorcycle issues and cross-reference them with specific parts and failure risks.
- **Dynamic Dependency Graph**: Relates part failures to secondary component risks (e.g., a leaking fork seal leading to front brake contamination).
- **Expert Review Portal**: Role-based access control (RBAC) workflow allowing certified mechanics and enthusiasts to edit and verify diy guides and part failure indices.
- **Rider App (Offline Cache & Analytics)**: An Android-first Expo React Native app featuring offline-capable anatomy lists, guide viewer, and step-by-step DIY instructions.

---

## 🏗️ Architecture at a Glance

```
motomap/
├── motomap-api/          # FastAPI backend (Python)
├── motomap-contributor/  # Next.js contributor + review portal (web)
└── motomap-app/          # React Native rider app (Android-first)
```

---

## 💻 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Backend** | FastAPI + Python 3.11 | Async, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | PostgreSQL 15 + `pgvector` | Store relational data + part embeddings |
| **Cache** | Redis 7 | Rates, API rate limiting, anatomy maps |
| **Storage** | Cloudflare R2 | CDN storage for images, parts, and guides |
| **Search** | PostgreSQL FTS & pgvector | Semantic & hybrid search for issues |
| **AI Integration** | Claude API (Sonnet 3.5) | Vision-based diagnostics, structured JSON outputs |
| **Authentication** | Clerk Auth | JWT bridge, RBAC system |
| **Mobile App** | React Native (Expo) | Cross-platform, optimized for Android |
| **Web Portal** | Next.js 14 | Responsive web layout for contributors & admins |

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Python 3.11** or higher
- **Node.js v18+** & **npm**
- **Docker** & **Docker Compose**
- **PostgreSQL 15** (if running locally without Docker)
- **Expo Go** app on your Android device (for mobile testing)

---

### 1. Backend API (`motomap-api`)
The backend provides a RESTful JSON API.

1. Navigate to the API directory:
   ```bash
   cd motomap-api
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env` (copy from `.env.example` if available).
5. Run migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The API will be available at `http://localhost:8000` (docs at `/docs`).*

---

### 2. Contributor Portal (`motomap-contributor`)
Web application built in Next.js 14 for review and contribution management.

1. Navigate to the contributor directory:
   ```bash
   cd motomap-contributor
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local` for Clerk Auth.
4. Run the development server:
   ```bash
   npm run dev
   ```
   *The web portal will be available at `http://localhost:3000`.*

---

### 3. Rider Mobile App (`motomap-app`)
React Native application utilizing Expo Go.

1. Navigate to the mobile app directory:
   ```bash
   cd motomap-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch Expo:
   ```bash
   npx expo start --android
   ```
4. Scan the QR code using the Expo Go application on your Android device.

---

### Running with Docker
To spin up the entire ecosystem (API, Web, DB, Cache) using Docker Compose:
```bash
docker-compose up -d --build
```

---

## 🧠 Core Domain Concepts

- **Bike**: The root entity (e.g. *Bajaj Pulsar 150*).
- **Part**: Belongs to a Bike. Contains functionality descriptions, diagnostic symptoms, risk levels (`SAFE`, `CAUTION`, `STOP`), and links to adjacent parts (connections).
- **DIYGuide**: Step-by-step guide mapping to a particular Bike and Part combination. Classified by difficulty (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`).
- **Contribution**: Community submitted guides or part edits. Status flow: `PENDING` ➔ `IN_REVIEW` ➔ `APPROVED`/`REJECTED`.
- **User Roles**: `RIDER` ➔ `VERIFIED_ENTHUSIAST` ➔ `EXPERT_REVIEWER` ➔ `BRAND_OFFICIAL` ➔ `ADMIN`.

---

## 🛡️ Safety-Critical Rules

1. **Expert Reviews Mandatory**: Any modification to risk levels (`SAFE`, `CAUTION`, `STOP`) must be manually approved by an `EXPERT_REVIEWER`.
2. **AI Reliability Threshold**: AI Vision diagnoses require confidence $\ge 0.6$. If lower, a `low_confidence_warning` is shown and the system defaults to directing the rider to a mechanic.
3. **No Unsupervised "Stop Immediately" Warnings**: Crucial diagnostic safety warnings must surface mechanical verification steps instead of creating panic.
4. **Append-Only History**: Contribution logs and version histories are permanently kept to maintain audits.

---

## 📂 Project Structure

```
motomap/
├── .claude/                # Agent configurations and developer rules
├── motomap-api/            # FastAPI, Alembic, DB schemas, AI routers
│   ├── app/
│   │   ├── api/            # API Router definitions
│   │   ├── core/           # Config, Security, JWT Bridge
│   │   ├── models/         # SQLAlchemy DB models
│   │   └── services/       # AI (Claude API), Storage (R2)
│   └── alembic/            # Database migrations
├── motomap-app/            # Expo React Native mobile application
│   ├── components/         # Mobile components (badges, status cards)
│   └── screens/            # Rider views (Diagnose, Guide, Home)
├── motomap-contributor/    # Next.js web application
│   ├── src/
│   │   ├── app/            # App router paths (reviews, editor)
│   │   └── components/     # UI elements
└── Motomap_PRD_v1.docx     # Project Product Requirements Document
```

---

## 🤝 Contributing

For detailed dev logs and instructions, check out:
- [DEVLOG.md](./DEVLOG.md) — For phase-by-phase updates and architectural decisions.
- [CLAUDE.md](./CLAUDE.md) — For developer rules, typing constraints, and standards.
