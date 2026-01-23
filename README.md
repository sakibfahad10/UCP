# UCP — Universal Coding Platform

A high-performance, aesthetically-driven Competitive Programming and Online Judge platform built with **Next.js 15**, **Supabase**, and **Tailwind CSS 4**.

## 🚀 Overview

UCP is a modern arena for developers to sharpen their algorithmic skills, compete in real-time contests, and track their progress. It features a robust code execution engine, a focused IDE experience, and a comprehensive administrative dashboard for managing the competitive environment.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (Authentication, PostgreSQL Database, Storage)
- **Styling**: [Tailwind CSS 4.x](https://tailwindcss.com/) with Vanilla CSS enhancements
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (The engine behind VS Code)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Database Logic**: Custom PL/pgSQL views and triggers for real-time standings

## ✨ Key Features

### ⚔️ The Arena (Contests)
- **Live Contests**: Real-time participation with dedicated problem sets.
- **Dynamic Standings**: ICPC-style penalty calculation and instant scoreboard updates.
- **Registration System**: Managed entry for upcoming and active battles.

### 💻 Solution Engine (IDE)
- **Multilingual Support**: Write and execute C++17, Python 3, and Java 11.
- **Inline Solve**: Seamless transition between problem statements and the code editor within the arena.
- **Integrated Terminal**: View execution logs, stdout, and CPU time directly.

### 📊 Performance Tracking
- **Global Leaderboard**: Ranking of all warriors based on total solved problems and scores.
- **User Profiles**: Personalized dashboards showing success rates, submission history, and skills.

### 🛡️ Administrative Control
- **Contest Management**: Tools to schedule, reveal, and manage contest parameters.
- **Problem Laboratory**: Interface for creating and editing challenges with sample test cases.

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router (Pages, API, Layouts)
│   ├── admin/            # Administrative dashboard sectors
│   ├── api/              # Execution and judge endpoints
│   ├── auth/             # Authentication flows (Login, Signup)
│   ├── contests/         # The Arena: Dashboard, Standings, Problems
│   ├── problems/         # Task library and solving interfaces
│   └── profile/          # User performance matrix
├── components/           # Reusable UI components (IDE, Headers, Cards)
├── lib/                  # Core configurations (Supabase Client, Utilities)
├── scripts/              # Database schema and view definitions (SQL)
├── public/               # Static assets and media
└── styles/               # Global design tokens and utilities
```

## 🛠️ Local Development

1. **Clone and Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Configuration**:
   Create a `.env` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database Setup**:
   Execute the scripts found in the `scripts/` directory in your Supabase SQL Editor to initialize the schema and views.

4. **Launch the Station**:
   ```bash
   pnpm dev
   ```

## 🎨 Design Philosophy

UCP prioritizes **Visual Excellence** and **Developer UX**. The interface uses:
- **Rich Aesthetics**: Vibrant gradients, sleek dark modes, and glassmorphism.
- **Dynamic Feedback**: Micro-animations and hover effects that make the platform feel alive.
- **Premium Typography**: High-readability fonts tailored for both code and content.

---
*Built for the competitive code-smiths of tomorrow.*
