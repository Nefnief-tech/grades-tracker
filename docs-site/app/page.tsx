import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 py-24 px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-5xl">📊</span>
          <h1 className="text-5xl font-bold tracking-tight">Grade Tracker</h1>
        </div>
        <p className="max-w-2xl text-xl text-fd-muted-foreground">
          A modern, intuitive grade management application for students — built
          with Next.js 15, React 19, TypeScript, Tailwind CSS, and Appwrite.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://img.shields.io/badge/Next.js-15.1.0-black"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img
            src="https://img.shields.io/badge/Next.js-15.1.0-black"
            alt="Next.js"
          />
        </a>
        <a
          href="https://img.shields.io/badge/TypeScript-5.0-blue"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img
            src="https://img.shields.io/badge/TypeScript-5.0-blue"
            alt="TypeScript"
          />
        </a>
        <a
          href="https://img.shields.io/badge/React-19.0-61dafb"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img
            src="https://img.shields.io/badge/React-19.0-61dafb"
            alt="React"
          />
        </a>
        <a
          href="https://img.shields.io/badge/License-MIT-green"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img
            src="https://img.shields.io/badge/License-MIT-green"
            alt="License"
          />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full">
        {[
          {
            icon: "🚀",
            title: "Getting Started",
            desc: "Install, configure, and run Grade Tracker in minutes",
            href: "/grades-tracker/docs/getting-started",
          },
          {
            icon: "⚙️",
            title: "Configuration",
            desc: "All environment variables and config options",
            href: "/grades-tracker/docs/configuration",
          },
          {
            icon: "🏗️",
            title: "Architecture",
            desc: "System design, data model, and component breakdown",
            href: "/grades-tracker/docs/architecture",
          },
          {
            icon: "📖",
            title: "API Reference",
            desc: "Public modules, hooks, utilities, and API routes",
            href: "/grades-tracker/docs/api",
          },
          {
            icon: "📚",
            title: "Guides",
            desc: "Step-by-step walkthroughs for common tasks",
            href: "/grades-tracker/docs/guides/adding-grades",
          },
          {
            icon: "❓",
            title: "FAQ",
            desc: "Common questions and troubleshooting tips",
            href: "/grades-tracker/docs/faq",
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col gap-2 rounded-xl border border-fd-border bg-fd-card p-5 text-left transition-colors hover:bg-fd-accent"
          >
            <span className="text-2xl">{card.icon}</span>
            <h2 className="font-semibold text-fd-foreground group-hover:text-fd-primary">
              {card.title}
            </h2>
            <p className="text-sm text-fd-muted-foreground">{card.desc}</p>
          </Link>
        ))}
      </div>

      <div className="flex gap-4">
        <Link
          href="/grades-tracker/docs"
          className="rounded-lg bg-fd-primary px-6 py-3 text-sm font-semibold text-fd-primary-foreground hover:bg-fd-primary/90 transition-colors"
        >
          Read the Docs
        </Link>
        <a
          href="https://github.com/Nefnief-tech/grades-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-fd-border px-6 py-3 text-sm font-semibold text-fd-foreground hover:bg-fd-accent transition-colors"
        >
          View on GitHub
        </a>
      </div>
    </main>
  );
}
