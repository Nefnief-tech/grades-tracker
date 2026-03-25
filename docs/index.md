# Grade Tracker

<div align="center">
  <strong>A modern, intuitive grade management application for students</strong>
</div>

[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](license.md)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://nefnief-tech.github.io/grades-tracker/)

---

## What is Grade Tracker?

**Grade Tracker** is a full-featured web application that helps students manage their academic performance. It provides a clean dashboard to record grades across subjects, view historical trends, and sync data securely to the cloud—all without sacrificing privacy.

The application works entirely offline in **local-only mode** and optionally connects to an [Appwrite](https://appwrite.io/) backend for multi-device cloud synchronisation with end-to-end encryption.

---

## Key Features

| Feature | Description |
|---|---|
| 📚 **Subject Management** | Create, organise, and colour-code academic subjects |
| 📊 **Grade Tracking** | Record grades with types (Test, Oral Exam, Homework, Project) and configurable weights |
| 📈 **Visual Analytics** | Interactive charts showing grade history and performance trends |
| ☁️ **Cloud Sync** | Optional synchronisation across multiple devices via Appwrite |
| 🔐 **Data Privacy** | AES-256-CBC end-to-end encryption for all grade data |
| 🌗 **Dark / Light Mode** | System-aware theme with manual toggle |
| 📱 **Responsive Design** | Fully usable on desktop, tablet, and mobile |
| 🗂️ **Kanban Board** | Task/study planning board with drag-and-drop |
| ⏱️ **Study Timer** | Pomodoro-style timer with session tracking |
| 📅 **Academic Calendar** | Timetable management with recurring entries |
| 🔑 **Two-Factor Auth** | TOTP-based 2FA for cloud accounts |
| 🌐 **Internationalisation** | English, French, German, and Spanish UI |

---

## Live Demo

> The application can be self-hosted via Docker or deployed on Railway, Fly.io, or any Node.js platform.  
> See [Getting Started](getting-started.md) for instructions.

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Nefnief-tech/grades-tracker.git
cd grades-tracker

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Appwrite credentials (optional for local mode)

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Backend / BaaS | Appwrite |
| State Management | React Context API + Zustand |
| Data Visualisation | Recharts |
| Charts & Animations | Framer Motion |
| Drag & Drop | dnd-kit |
| Form Handling | React Hook Form + Zod |
| Internationalisation | next-intl |
| Deployment | Docker / Railway / Fly.io |

---

## Documentation Structure

- **[Getting Started](getting-started.md)** – Installation and first run
- **[Configuration](configuration.md)** – Environment variables and options
- **[Architecture](architecture.md)** – System design and data flow
- **[API Reference](api/index.md)** – Public modules and utilities
- **[Guides](guides/adding-grades.md)** – Step-by-step walkthroughs
- **[Testing](testing.md)** – Running and writing tests
- **[Contributing](contributing.md)** – How to contribute
- **[Changelog](changelog.md)** – Version history
- **[FAQ](faq.md)** – Common questions and troubleshooting
- **[License](license.md)** – MIT License
