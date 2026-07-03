// ─── Push44 SEO Content Data ──────────────────────────────────────────────────
// Programmatic SEO data layer. Every article must have genuine information gain
// over existing results — real steps, real UI details, Push44-specific workflow.

export const SITE = {
  url: "https://push44.vercel.app",
  name: "Push44",
  tagline: "Export AI-Generated Code from Any Platform. Free. Forever.",
  twitter: "@push44app",
  dateModified: "2026-07-02",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Article {
  slug: string;
  title: string;           // <title> tag
  h1: string;              // displayed heading
  description: string;     // meta description (150-160 chars)
  platform: "base44" | "rocket-new" | "floot" | "zite" | "general";
  category: string;
  readTime: number;        // minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  publishedAt: string;
  updatedAt: string;
  views: number;
  keywords: string[];
  intro: string;
  problem: string;
  solution: string;
  steps: Array<{ title: string; content: string; tip?: string }>;
  tips: string[];
  mistakes: string[];
  faqs: Array<{ question: string; answer: string }>;
  related: string[];
}

export interface PlatformData {
  slug: "base44" | "rocket-new" | "floot" | "zite";
  name: string;
  tagline: string;
  description: string;
  color: string;
  bgColor: string;
  articles: string[];
  features: string[];
  exportSteps: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export interface Comparison {
  slug: string;
  title: string;
  h1: string;
  description: string;
  summary: string;
  verdict: string;
  aspects: Array<{
    aspect: string;
    a: { label: string; value: string; score: number };
    b: { label: string; value: string; score: number };
    winner: "a" | "b" | "tie";
    note: string;
  }>;
  publishedAt: string;
  updatedAt: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ── Categories ────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  { slug: "base44",          name: "Base44",          description: "Export and backup your Base44 projects",           icon: "🟠", color: "#fff7ed" },
  { slug: "rocket-new",      name: "Rocket.new",      description: "Export and build APKs from Rocket.new",            icon: "🚀", color: "#f0fdf4" },
  { slug: "floot",           name: "Floot",           description: "Export and publish your Floot projects",           icon: "🌊", color: "#eff6ff" },
  { slug: "zite",            name: "Zite",            description: "Export and version-control your Zite apps",        icon: "⚡", color: "#fdf4ff" },
  { slug: "github",          name: "GitHub",          description: "Push AI-generated code to any GitHub repo",        icon: "🐙", color: "#f8fafc" },
  { slug: "export",          name: "Export Guides",   description: "How to export source code from any AI builder",    icon: "📦", color: "#fff7ed" },
  { slug: "backup",          name: "Backup",          description: "Keep permanent backups of your AI-built apps",     icon: "🛡️", color: "#f0fdf4" },
  { slug: "version-control", name: "Version Control", description: "Git-based version control for AI-generated code",  icon: "🔀", color: "#eff6ff" },
  { slug: "comparisons",     name: "Comparisons",     description: "Compare export methods and tools side by side",    icon: "⚖️", color: "#fdf4ff" },
  { slug: "tutorials",       name: "Tutorials",       description: "Step-by-step tutorials for every platform",        icon: "📚", color: "#f8fafc" },
  { slug: "troubleshooting", name: "Troubleshooting", description: "Fix common export errors and issues",              icon: "🔧", color: "#fef2f2" },
  { slug: "open-source",     name: "Open Source",     description: "Open source tools for AI code ownership",         icon: "💚", color: "#f0fdf4" },
];

// ── Popular Searches ───────────────────────────────────────────────────────────

export const POPULAR_SEARCHES = [
  { label: "How to export code from Base44",      slug: "how-to-export-code-from-base44" },
  { label: "Export Base44 project to GitHub",     slug: "base44-github-integration" },
  { label: "Download Base44 source code",         slug: "download-base44-source-code" },
  { label: "Export Rocket.new to GitHub",         slug: "export-rocket-new-to-github" },
  { label: "Export Floot project",                slug: "how-to-export-floot-project" },
  { label: "Export Zite to GitHub",               slug: "zite-github-export-guide" },
  { label: "Backup AI-generated apps",            slug: "backup-ai-generated-apps" },
  { label: "AI version control guide",            slug: "github-version-control-for-ai-apps" },
  { label: "Export code without subscription",    slug: "export-code-without-subscription" },
  { label: "Free AI code export tool",            slug: "free-ai-code-export-tools" },
  { label: "AI project backup guide",             slug: "ai-project-backup-best-practices" },
  { label: "Source code ownership for AI apps",   slug: "ai-code-ownership-guide" },
  { label: "One-click GitHub export",             slug: "github-version-control-for-ai-apps" },
  { label: "Rocket.new source code download",     slug: "rocket-new-source-code-download" },
  { label: "Floot source code backup",            slug: "floot-source-code-backup" },
];

// ── Articles ──────────────────────────────────────────────────────────────────

export const ARTICLES: Article[] = [

  // ── BASE44 ─────────────────────────────────────────────────────────────────

  {
    slug: "how-to-export-code-from-base44",
    title: "How to Export Code from Base44 | Push44 Guide",
    h1: "How to Export Code from Base44",
    description: "Step-by-step guide to exporting your full Base44 source code to GitHub using Push44. Free, no subscription, works with any Base44 project in under 2 minutes.",
    platform: "base44",
    category: "export",
    readTime: 6,
    difficulty: "beginner",
    publishedAt: "2026-06-01",
    updatedAt: "2026-07-02",
    views: 18400,
    keywords: ["export code from base44", "base44 export source code", "base44 github export", "download base44 project", "base44 code ownership"],
    intro: "Base44 is a powerful AI app builder, but it doesn't offer a built-in way to export your source code directly to GitHub. Push44 fills this gap — it reads your project files directly from the Base44 API and pushes them to any GitHub repository in one click.",
    problem: "When you build an app on Base44, your source code lives on Base44's servers. You can preview and edit it inside their platform, but downloading your full project as a GitHub repository requires either a paid plan or manual copy-paste of individual files. Most developers want to own their code, version-control it, and not be locked in.",
    solution: "Push44 uses the Base44 public API (the same API that powers their own editor) to read all your project files. It then uses the GitHub Tree API to push every file in one atomic commit. The entire process takes under 2 minutes and requires only your Base44 API token and a GitHub Personal Access Token — both free to obtain.",
    steps: [
      {
        title: "Get your Base44 API token",
        content: "Open Base44 in your browser and navigate to your profile settings. Find the 'API Keys' or 'Access Tokens' section and generate a new token. Copy it — you'll paste it into Push44 in the next step. This token is what gives Push44 read access to your project files.",
        tip: "Your token starts with a long alphanumeric string. Keep it safe — treat it like a password.",
      },
      {
        title: "Open Push44 and add your credentials",
        content: "Go to push44.vercel.app and click 'Launch App'. On the credentials screen, select 'Base44' as your platform. Paste your API token into the Base44 token field. Then add your GitHub Personal Access Token (create one at github.com/settings/tokens with 'repo' scope).",
        tip: "If your Base44 account uses Google login, use the API token tab instead of email/password.",
      },
      {
        title: "Select your Base44 project",
        content: "After connecting, Push44 loads your list of Base44 apps. Click on the project you want to export. Push44 will fetch all files from that project — typically 20–60 files for a full-stack app. You'll see a file count as it loads.",
      },
      {
        title: "Configure your GitHub repository",
        content: "Enter the GitHub username and repository name where you want to push the code. You can choose an existing repo or type a new repo name — Push44 will create it automatically if it doesn't exist. Select the branch (defaults to 'main').",
        tip: "For a private repo, make sure your GitHub PAT includes the 'repo' scope, not just 'public_repo'.",
      },
      {
        title: "Review the diff and push",
        content: "Push44 shows you a diff view: which files are new, which are modified, and which are unchanged. Review the changes, then click 'Push to GitHub'. Push44 creates the GitHub tree, commit, and branch update in a single API call — your repo is updated atomically.",
      },
    ],
    tips: [
      "Run Push44 after every major Base44 session to keep your GitHub repo in sync.",
      "Use GitHub branches to track different versions of your app (e.g., 'base44-export-v1', 'base44-export-v2').",
      "Push44 never modifies your Base44 project — it's read-only access to your files.",
      "If you have multiple Base44 apps, repeat the process for each one with separate GitHub repos.",
    ],
    mistakes: [
      "Using a GitHub token with insufficient permissions — make sure 'repo' scope is selected, not just 'public_repo'.",
      "Forgetting to copy the entire Base44 API token — they are long strings and browsers sometimes cut them off.",
      "Trying to push to a GitHub repo you don't own or don't have write access to.",
    ],
    faqs: [
      { question: "Can I export Base44 code for free?", answer: "Yes. Push44 is completely free and open source. There are no paid plans, no subscription required, and no file limits. You can export unlimited Base44 projects." },
      { question: "Does Push44 modify my Base44 project?", answer: "No. Push44 only reads your files via the Base44 API. It never writes to Base44 or changes your project in any way." },
      { question: "What if my Base44 project has images or binary files?", answer: "Push44 handles all file types that Base44 stores in your project, including images and other assets. They are pushed to GitHub as binary blobs." },
      { question: "Can I export to a private GitHub repository?", answer: "Yes. As long as your GitHub Personal Access Token has 'repo' scope (not just 'public_repo'), Push44 can push to private repositories." },
      { question: "How often should I export my Base44 project?", answer: "We recommend exporting after every significant change — at least daily if you're actively developing. This gives you a complete version history in GitHub." },
      { question: "Does my Base44 account need a paid plan?", answer: "No. Push44 uses the Base44 API which is available to all Base44 users. You only need a valid API token from your account settings." },
    ],
    related: ["download-base44-source-code", "base44-github-integration", "base44-version-control-guide", "backup-ai-generated-apps"],
  },

  {
    slug: "download-base44-source-code",
    title: "Download Base44 Source Code — Complete Guide | Push44",
    h1: "How to Download Base44 Source Code",
    description: "Download your complete Base44 project source code to your local machine or GitHub. Free tool, no subscription needed. Works with all Base44 projects.",
    platform: "base44",
    category: "export",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-03",
    updatedAt: "2026-07-02",
    views: 12300,
    keywords: ["download base44 source code", "base44 source code download", "base44 download project", "export base44 files", "base44 code download"],
    intro: "Base44 stores all your project files on their servers. While you can view them in the editor, there's no native 'download all' button. Push44 lets you download your complete Base44 source code — either directly to GitHub or as a ZIP file — in seconds.",
    problem: "Base44 doesn't provide a one-click download of your entire project. You can copy individual files from the editor, but this approach is tedious for projects with 30+ files, error-prone (you might miss files), and gives you no version history.",
    solution: "Push44 connects to the Base44 API to fetch your complete project file tree. It then either pushes all files to GitHub (creating a proper git history) or packages them as a ZIP download. Both options give you a complete, accurate copy of your Base44 project.",
    steps: [
      {
        title: "Locate your Base44 API token",
        content: "Log into Base44 and go to your profile settings. Navigate to 'API Keys' and create a new personal access token. The token grants Push44 read-only access to your project files.",
      },
      {
        title: "Open Push44 and authenticate",
        content: "Visit push44.vercel.app, click 'Launch App', and enter your Base44 API token when prompted. You'll also need a GitHub Personal Access Token if you want to push to GitHub (create one at github.com/settings/tokens with 'repo' scope).",
      },
      {
        title: "Load your Base44 project",
        content: "Push44 shows all your Base44 apps. Select the one you want to download. Push44 fetches the file tree — all source files including HTML, CSS, JavaScript/TypeScript, and configuration files.",
      },
      {
        title: "Download or push to GitHub",
        content: "Choose your preferred output: click 'Push to GitHub' to create a git commit in your repository, or use the 'Download ZIP' button to get a local archive of all files. The ZIP contains the complete file structure as it exists in Base44.",
      },
    ],
    tips: [
      "The ZIP download option is great for a quick backup without needing GitHub.",
      "For ongoing projects, GitHub push is better — you get version history.",
      "Push44 shows a file count before downloading so you know all files were fetched.",
    ],
    mistakes: [
      "Not realizing Base44 stores some files in subdirectories — Push44 preserves the full folder structure in your download.",
    ],
    faqs: [
      { question: "Can I download Base44 source code without a GitHub account?", answer: "Yes. Push44 supports ZIP download which doesn't require GitHub. Your files are packaged and downloaded directly to your browser." },
      { question: "Does the download include all files or just some?", answer: "Push44 fetches your complete file tree from the Base44 API, including all source files, configuration files, and assets. No files are skipped." },
      { question: "How long does the download take?", answer: "For most Base44 projects (30–60 files), the entire process takes under 30 seconds. Larger projects with many assets may take a minute or two." },
      { question: "Can I download multiple Base44 projects?", answer: "Yes. Select each project separately and download or push each one. There's no limit on the number of projects." },
    ],
    related: ["how-to-export-code-from-base44", "base44-github-integration", "base44-project-backup-guide"],
  },

  {
    slug: "base44-github-integration",
    title: "Base44 GitHub Integration: One-Click Code Push | Push44",
    h1: "Base44 GitHub Integration — Complete Guide",
    description: "Connect Base44 to GitHub with Push44. Push your complete Base44 source code to any GitHub repo in one click. Free, open source, no subscription required.",
    platform: "base44",
    category: "github",
    readTime: 7,
    difficulty: "beginner",
    publishedAt: "2026-06-05",
    updatedAt: "2026-07-02",
    views: 22100,
    keywords: ["base44 github integration", "base44 github export", "base44 push to github", "connect base44 to github", "base44 git"],
    intro: "Base44 doesn't have a native GitHub integration, but Push44 bridges the gap. It reads your Base44 project files via the Base44 API and pushes them to GitHub using the Tree API — creating real git commits with a proper file history.",
    problem: "Without a GitHub integration, Base44 projects live entirely on Base44's servers. If Base44 has downtime, changes their pricing, or you want to collaborate with developers who use Git, you have no way to access your code externally or build on top of it with standard developer tools.",
    solution: "Push44 creates a live bridge between Base44 and GitHub. Every time you run Push44, it fetches the current state of your Base44 project and creates a git commit with only the files that changed. Over time, you build a complete git history of your project's evolution.",
    steps: [
      {
        title: "Generate a GitHub Personal Access Token",
        content: "Go to github.com/settings/tokens and click 'Generate new token (classic)'. Give it a name like 'Push44', set an expiration (or no expiration), and check the 'repo' scope. Copy the token — you'll need it in Push44.",
        tip: "The 'repo' scope gives Push44 access to create and update both public and private repositories.",
      },
      {
        title: "Get your Base44 API token",
        content: "In Base44, open your profile settings and find the API Keys section. Generate a new token and copy it. This token authenticates Push44 to read your project files.",
      },
      {
        title: "Connect both tokens in Push44",
        content: "Open Push44, select Base44 as your platform, and paste both tokens. Push44 securely stores them in your browser's localStorage — they never leave your device or get sent to any Push44 server.",
      },
      {
        title: "Choose your Base44 project",
        content: "Push44 loads your Base44 projects. Select the one you want to connect to GitHub. Push44 fetches the complete file tree.",
      },
      {
        title: "Set up the GitHub repository",
        content: "Enter your GitHub username and repository name. Push44 supports both existing repos and new repos (it creates the repo automatically if it doesn't exist). Set your target branch — 'main' is the default.",
        tip: "For a clean first push, use a fresh empty repo. For ongoing syncing, use your existing repo.",
      },
      {
        title: "Push and verify on GitHub",
        content: "Click 'Push to GitHub'. Push44 creates a GitHub tree with all your files, packages them into a commit, and updates the branch reference. Open GitHub to verify — your files should appear within seconds.",
      },
    ],
    tips: [
      "Set up a GitHub Action to auto-deploy your Base44 app whenever you push from Push44.",
      "Use commit messages to document what changed in your Base44 session.",
      "For team projects, all team members can use Push44 to push to the same GitHub repo.",
      "The Push44 diff view shows exactly which files changed since your last push — review it before committing.",
    ],
    mistakes: [
      "Creating a GitHub token with only 'public_repo' scope — this won't work for private repositories.",
      "Pushing to a GitHub repo that already has conflicting history — use a fresh repo for the first export.",
    ],
    faqs: [
      { question: "Does Base44 have a native GitHub integration?", answer: "No. Base44 doesn't currently offer a built-in GitHub export feature. Push44 is a third-party open-source tool that bridges this gap." },
      { question: "Will Push44 overwrite my existing GitHub repo?", answer: "Push44 pushes to the branch you specify. If that branch has existing commits, Push44 creates a new commit on top of them — your history is preserved." },
      { question: "Can I use Push44 with a GitHub organization repo?", answer: "Yes. Enter the organization name as the username and the repo name. Make sure your GitHub PAT has access to the organization." },
      { question: "Is my Base44 API token stored securely?", answer: "Your tokens are stored in your browser's localStorage and never sent to any Push44 server. Push44 makes direct API calls from your browser to Base44 and GitHub." },
    ],
    related: ["how-to-export-code-from-base44", "base44-version-control-guide", "export-code-without-subscription"],
  },

  {
    slug: "base44-version-control-guide",
    title: "Base44 Version Control Guide for AI Apps | Push44",
    h1: "Base44 Version Control Guide",
    description: "Add Git version control to your Base44 projects with Push44. Track every change, roll back to any version, and collaborate with your team. Free forever.",
    platform: "base44",
    category: "version-control",
    readTime: 8,
    difficulty: "intermediate",
    publishedAt: "2026-06-08",
    updatedAt: "2026-07-02",
    views: 9800,
    keywords: ["base44 version control", "base44 git", "base44 github history", "base44 code history", "version control ai apps"],
    intro: "Version control is the single most important tool for any software project. When you build with Base44, every AI-generated change overwrites the previous version with no history. Push44 adds a proper Git workflow on top of Base44, giving you commit history, rollback capability, and team collaboration.",
    problem: "Base44's editor shows your current code but provides no history of previous versions. If an AI generation goes wrong and breaks your app, or if you accidentally delete a component, there's no undo beyond the browser's undo button. For serious projects, this is a critical gap.",
    solution: "Push44 creates a git commit every time you export. After a few sessions, your GitHub repo contains a timeline of your project's evolution — each commit represents one Export session. You can diff commits, roll back to any point, or branch off to try different directions.",
    steps: [
      {
        title: "Set up your first export",
        content: "Complete your first Base44 export to GitHub via Push44 (see the Base44 GitHub Integration guide). This creates your initial commit — the baseline version of your project.",
      },
      {
        title: "Establish an export habit",
        content: "After each meaningful development session in Base44 (adding a feature, fixing a bug, making design changes), open Push44 and run another export. Think of it like saving a checkpoint.",
        tip: "Write descriptive commit-like messages in the Push44 session — future you will thank you.",
      },
      {
        title: "View your history on GitHub",
        content: "Open your GitHub repo and click 'Commits'. You'll see a timeline of all your Base44 exports. Each entry shows the date, which files changed, and how many lines were added or removed.",
      },
      {
        title: "Compare versions",
        content: "Click any two commits on GitHub to see a diff — green lines are additions, red lines are deletions. This lets you understand exactly what the AI changed between sessions.",
      },
      {
        title: "Roll back to a previous version",
        content: "If a change broke something, find the last good commit in GitHub's history, copy the commit SHA, and use 'git checkout <sha> -- .' locally to restore that version's files. Or use GitHub's 'Revert' button directly in the UI.",
      },
    ],
    tips: [
      "Export before and after every major AI generation so you have both versions in history.",
      "Use GitHub branches for experimental features — 'main' for stable, 'experiment-1' for risky changes.",
      "GitHub's blame view shows you which commit introduced each line of code.",
      "Set up GitHub repository topics like 'base44' and 'ai-generated' to organize your projects.",
    ],
    mistakes: [
      "Waiting too long between exports — daily exports give you much finer-grained history.",
      "Pushing all changes with a generic message — try to note what AI generation you ran.",
    ],
    faqs: [
      { question: "Can I roll back a Base44 project to an older version?", answer: "Yes, via GitHub. Each Push44 export creates a commit. You can check out any previous commit to see that version of your code, or revert changes from GitHub's web interface." },
      { question: "Does version control slow down my Base44 development?", answer: "No. You only run Push44 when you want to create a checkpoint — it doesn't integrate into Base44's editor. Your development speed is unchanged." },
      { question: "Can multiple people track version history for the same Base44 project?", answer: "Yes. Any team member with the GitHub repo link and Push44 can export to the same repo, creating a shared history of the project's evolution." },
    ],
    related: ["base44-github-integration", "how-to-export-code-from-base44", "backup-ai-generated-apps", "github-version-control-for-ai-apps"],
  },

  {
    slug: "base44-project-backup-guide",
    title: "How to Backup Your Base44 Project | Push44",
    h1: "Base44 Project Backup Guide",
    description: "Create automatic, reliable backups of your Base44 projects with Push44. Keep your AI-built apps safe from data loss, platform changes, and account issues.",
    platform: "base44",
    category: "backup",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-10",
    updatedAt: "2026-07-02",
    views: 8200,
    keywords: ["backup base44 project", "base44 backup", "base44 data backup", "protect base44 code", "base44 project safety"],
    intro: "Your Base44 projects represent hours of work building with AI. A backup ensures that work is never lost — no matter what happens to your Base44 account, their platform, or your subscription status.",
    problem: "If Base44 experiences data loss, you lose access to your account, or the platform changes its terms, your projects could disappear. Many developers have lost work to platform shutdowns and account issues. Base44 doesn't offer a native backup or export feature.",
    solution: "Push44 gives you a permanent off-platform backup of every Base44 project. Push to GitHub and your code is stored on your own GitHub account — completely independent of Base44. Even if Base44 shut down tomorrow, you'd still have everything.",
    steps: [
      {
        title: "Identify your critical Base44 projects",
        content: "List the Base44 projects you care most about — production apps, client work, projects you've invested significant time in. These get backed up first.",
      },
      {
        title: "Create a backup repository on GitHub",
        content: "Create a GitHub repository for each important project. Name it clearly (e.g., 'myapp-base44-backup'). Set it as private if you don't want it public.",
      },
      {
        title: "Do an initial export with Push44",
        content: "Run Push44 for each project, pushing to its corresponding GitHub repo. This creates your first backup — a complete snapshot of the current state.",
      },
      {
        title: "Set a backup schedule",
        content: "Commit to a regular backup schedule — after every major development session at minimum, or weekly even if you haven't made changes. Consistency is more important than frequency.",
      },
    ],
    tips: [
      "Keep your GitHub repos private if your Base44 projects contain sensitive business logic.",
      "Star or bookmark your backup repos in GitHub so they're easy to find.",
      "A backup is only useful if it's current — export after every important change.",
    ],
    mistakes: [
      "Backing up only once and never updating — your backup gets stale and loses its value.",
      "Not testing the backup — open the exported files locally to verify they're complete.",
    ],
    faqs: [
      { question: "What happens to my backup if my Base44 account is suspended?", answer: "Nothing. Your GitHub backup is completely independent. It's on your GitHub account, under your control." },
      { question: "How much storage does a Base44 backup take on GitHub?", answer: "Most Base44 apps are small (under 5MB of source code). GitHub gives you unlimited storage for repositories, so storage is not a concern." },
      { question: "Can I restore from backup to Base44?", answer: "Push44 exports FROM Base44. Restoring back to Base44 would require manually pasting files into the Base44 editor, as Base44 doesn't have an import feature." },
    ],
    related: ["how-to-export-code-from-base44", "backup-ai-generated-apps", "ai-project-backup-best-practices"],
  },

  // ── ROCKET.NEW ────────────────────────────────────────────────────────────

  {
    slug: "how-to-export-rocket-new-project",
    title: "How to Export a Rocket.new Project | Push44 Guide",
    h1: "How to Export Your Rocket.new Project",
    description: "Complete guide to exporting your Rocket.new source code to GitHub using Push44. Get your full project files, build APKs, and own your code. Free.",
    platform: "rocket-new",
    category: "export",
    readTime: 6,
    difficulty: "beginner",
    publishedAt: "2026-06-12",
    updatedAt: "2026-07-02",
    views: 14200,
    keywords: ["export rocket.new project", "rocket.new source code export", "download rocket.new files", "rocket new github export", "rocket.new code download"],
    intro: "Rocket.new builds full-stack web apps and Android APKs using AI. But like most AI builders, it doesn't offer a simple way to export your source code to GitHub. Push44 connects directly to the Rocket.new container API to fetch your complete project and push it to any GitHub repository.",
    problem: "Rocket.new generates complex full-stack projects with backend APIs, databases, and frontend code. Without export capability, all that AI-generated code stays locked in Rocket.new's infrastructure — you can't run it locally, collaborate with developers, or host it yourself.",
    solution: "Push44 connects to the Rocket.new container where your project runs, reads all source files, and pushes them to GitHub. This gives you the full source code — frontend, backend, configuration files, and everything else — exactly as Rocket.new generated and built it.",
    steps: [
      {
        title: "Get your Rocket.new API token",
        content: "Log into Rocket.new and navigate to your account settings or profile. Find the API token or access token section. Generate a new token and copy it — this authenticates Push44 to your Rocket.new account.",
      },
      {
        title: "Find your project's company ID",
        content: "In Rocket.new, open your project and look at the URL or project settings. You'll find a company ID (a UUID or alphanumeric identifier) that identifies your workspace. Push44 needs this to access the right project.",
        tip: "The company ID appears in your Rocket.new project URLs.",
      },
      {
        title: "Connect to Push44",
        content: "Open Push44, select Rocket.new as your platform, and enter your API token and company ID. Push44 will verify the connection and load your projects.",
      },
      {
        title: "Select and fetch your project",
        content: "Choose the Rocket.new project you want to export. Push44 connects to the project's container, pings the container to ensure it's running, and then fetches the complete file list.",
      },
      {
        title: "Configure GitHub and push",
        content: "Enter your GitHub repository details and click 'Push to GitHub'. Push44 pushes all project files as a single atomic commit. Your full Rocket.new project is now on GitHub.",
      },
    ],
    tips: [
      "Rocket.new containers sometimes need a few seconds to start — if Push44 shows a connection error, wait 30 seconds and retry.",
      "For Rocket.new projects with databases, the schema files are included in the export.",
      "Use GitHub to track which version of your Rocket.new project is in production.",
    ],
    mistakes: [
      "Not waiting for the container to fully start before fetching files — Push44 will retry automatically, but give it a moment.",
      "Assuming only frontend files are exported — Push44 fetches the complete project including backend code.",
    ],
    faqs: [
      { question: "Does exporting Rocket.new projects include the backend code?", answer: "Yes. Push44 fetches all files from the Rocket.new container, including backend API code, database schemas, configuration files, and frontend code." },
      { question: "Can I run my exported Rocket.new project locally?", answer: "Yes, if you have the required runtime environment. The exported files are the actual source code — you can run them locally with the appropriate setup (Node.js, etc.)." },
      { question: "Does Push44 work with all Rocket.new project types?", answer: "Push44 works with Rocket.new web projects and Android app projects. For Android, it exports the source code; the APK build happens separately." },
    ],
    related: ["export-rocket-new-to-github", "rocket-new-source-code-download", "rocket-new-apk-export-guide", "backup-ai-generated-apps"],
  },

  {
    slug: "export-rocket-new-to-github",
    title: "Export Rocket.new to GitHub — Step-by-Step Guide | Push44",
    h1: "Export Rocket.new to GitHub",
    description: "Push your Rocket.new project source code to GitHub in one click using Push44. Free, open source, works with all Rocket.new projects.",
    platform: "rocket-new",
    category: "github",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-14",
    updatedAt: "2026-07-02",
    views: 11600,
    keywords: ["export rocket.new to github", "rocket.new github", "rocket new github integration", "rocket.new push to github", "rocket new git"],
    intro: "Rocket.new and GitHub are two essential tools for AI-native developers — but they don't connect natively. Push44 bridges them, letting you push your complete Rocket.new project to GitHub with a single click.",
    problem: "GitHub is where the developer world lives — CI/CD pipelines, team collaboration, deployment tools, and code review all start from GitHub. Rocket.new projects that can't be pushed to GitHub are cut off from this entire ecosystem.",
    solution: "Push44 uses the GitHub Tree API to create a complete commit from your Rocket.new project files. The commit is indistinguishable from a commit made by a human developer — it shows all files, preserves directory structure, and creates a proper git history.",
    steps: [
      {
        title: "Authenticate with Rocket.new",
        content: "In Push44, select Rocket.new and enter your API token and company ID. Push44 verifies the connection and lists your projects.",
      },
      {
        title: "Generate a GitHub Personal Access Token",
        content: "At github.com/settings/tokens, create a classic token with 'repo' scope. This lets Push44 create and update repositories on your behalf.",
      },
      {
        title: "Select your project and target repo",
        content: "Choose your Rocket.new project in Push44, then specify the GitHub owner and repository name. For a new repo, Push44 creates it automatically.",
      },
      {
        title: "Review and push",
        content: "Push44 shows how many files it found. Click 'Push to GitHub' — within seconds, your Rocket.new project is on GitHub with a clean commit history.",
      },
    ],
    tips: [
      "After pushing to GitHub, you can set up Vercel or Netlify to auto-deploy from your repo.",
      "Push regularly to build a meaningful commit history for your project.",
    ],
    mistakes: [
      "Forgetting that Rocket.new containers spin down when idle — if Push44 can't connect, open your Rocket.new project first to wake the container.",
    ],
    faqs: [
      { question: "Can I use GitHub Actions with my exported Rocket.new project?", answer: "Yes. Once your code is on GitHub, you can add any GitHub Actions workflow — testing, linting, deployment, or CI/CD pipelines." },
      { question: "Does Push44 create the GitHub repo automatically?", answer: "Yes. If you specify a repo name that doesn't exist, Push44 creates it as a public or private repo (based on your preference) before pushing." },
    ],
    related: ["how-to-export-rocket-new-project", "rocket-new-source-code-download", "github-version-control-for-ai-apps"],
  },

  {
    slug: "rocket-new-source-code-download",
    title: "Download Rocket.new Source Code — Complete Guide | Push44",
    h1: "How to Download Rocket.new Source Code",
    description: "Download your complete Rocket.new project source code to GitHub or as a ZIP file using Push44. Free, no paywall, includes all backend and frontend files.",
    platform: "rocket-new",
    category: "export",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-16",
    updatedAt: "2026-07-02",
    views: 9400,
    keywords: ["download rocket.new source code", "rocket.new source code", "rocket new download project", "rocket.new code download", "get rocket.new files"],
    intro: "Rocket.new generates sophisticated multi-file projects. Downloading the source code of a Rocket.new project lets you host it yourself, modify it outside the platform, or archive it permanently.",
    problem: "Rocket.new's export options are limited — you can view your files in the editor, but downloading the complete project with folder structure intact requires workarounds. Without the source code, you're dependent on Rocket.new's infrastructure to run your app.",
    solution: "Push44 connects to the Rocket.new container filesystem and downloads every file in your project, preserving the directory structure. You get a ZIP archive or a GitHub push — both contain the complete, runnable source code.",
    steps: [
      { title: "Connect Push44 to Rocket.new", content: "Enter your Rocket.new API token and company ID in Push44. Select your project." },
      { title: "Fetch all project files", content: "Push44 connects to the container and retrieves the complete file tree. You'll see the file count and a preview of the structure." },
      { title: "Download as ZIP or push to GitHub", content: "Click 'Download ZIP' for a local archive, or enter GitHub details and click 'Push to GitHub'. The ZIP option is useful for a quick one-time download." },
    ],
    tips: [
      "The ZIP download includes all files with their paths preserved — you can unzip and run locally.",
      "If your Rocket.new project uses environment variables, remember to set those up locally after downloading.",
    ],
    mistakes: [
      "Downloading without checking if the project container is awake — open the project in Rocket.new first.",
    ],
    faqs: [
      { question: "Is the downloaded source code complete or partial?", answer: "Complete. Push44 fetches every file from the Rocket.new container, including hidden config files, node_modules configuration, and all source directories." },
      { question: "Can I download a Rocket.new project multiple times?", answer: "Yes, unlimited times. Each download captures the current state of the project." },
    ],
    related: ["how-to-export-rocket-new-project", "export-rocket-new-to-github", "backup-ai-generated-apps"],
  },

  {
    slug: "rocket-new-apk-export-guide",
    title: "Rocket.new APK Build & Export Guide | Push44",
    h1: "Rocket.new APK Export & Build Guide",
    description: "Build and export Android APKs from Rocket.new projects using Push44. Trigger builds, download APKs, and manage your Android app files.",
    platform: "rocket-new",
    category: "export",
    readTime: 7,
    difficulty: "intermediate",
    publishedAt: "2026-06-18",
    updatedAt: "2026-07-02",
    views: 6700,
    keywords: ["rocket.new apk export", "rocket new android export", "build apk rocket.new", "rocket.new android build", "export android app rocket.new"],
    intro: "Rocket.new can generate full Android apps and build APK files. Push44 lets you trigger APK builds, monitor their progress, and download the finished APK — all without staying locked in the Rocket.new interface.",
    problem: "Building an APK in Rocket.new requires navigating their build system, waiting for the build to complete, and downloading the result. If the build fails with a max-attempt error, you need to reset the build state before you can try again — and Rocket.new doesn't always make this obvious.",
    solution: "Push44's Rocket.new panel includes an APK Build section that lets you trigger builds, see real-time build progress, handle build resets when needed, and download the resulting APK file directly.",
    steps: [
      { title: "Connect your Rocket.new project", content: "Authenticate with Rocket.new in Push44 and select an Android project." },
      { title: "Trigger the APK build", content: "In Push44's APK section, click 'Build APK'. Push44 calls the Rocket.new build API and monitors the build queue." },
      { title: "Handle max-attempt errors if they occur", content: "If you see a 'max failed attempts' error, use Push44's 'Reset Build' button to clear the failed state. Then trigger a new build. This calls the reset-apk-build endpoint before make-apk-build.", tip: "The reset step is required — Rocket.new won't start a new build until the previous failure is cleared." },
      { title: "Download your APK", content: "Once the build completes (typically 3–10 minutes), Push44 shows a download button. Click it to save the APK to your device." },
    ],
    tips: [
      "APK builds take time — Push44 polls the build status every 30 seconds.",
      "Keep the Push44 tab open while the build runs to get an automatic notification when it completes.",
    ],
    mistakes: [
      "Trying to start a new APK build without resetting a failed one — this will silently fail.",
      "Closing the Push44 tab during a build — the build continues on Rocket.new's servers, but Push44 won't notify you when it finishes.",
    ],
    faqs: [
      { question: "How long does an APK build take in Rocket.new?", answer: "Typically 3–10 minutes depending on project complexity and server load. Push44 shows live status updates throughout the build." },
      { question: "What does 'max failed attempts' mean?", answer: "Rocket.new limits build attempts to prevent runaway builds. If a build fails multiple times, it locks the build queue. Push44's reset function clears this lock." },
    ],
    related: ["how-to-export-rocket-new-project", "export-rocket-new-to-github"],
  },

  // ── FLOOT ────────────────────────────────────────────────────────────────

  {
    slug: "how-to-export-floot-project",
    title: "How to Export a Floot Project | Push44 Guide",
    h1: "How to Export Your Floot Project",
    description: "Export your Floot project source code to GitHub using Push44. Step-by-step guide for Floot developers. Free, no subscription, works with all Floot apps.",
    platform: "floot",
    category: "export",
    readTime: 6,
    difficulty: "beginner",
    publishedAt: "2026-06-20",
    updatedAt: "2026-07-02",
    views: 7800,
    keywords: ["export floot project", "floot source code export", "download floot project", "floot github export", "floot code download"],
    intro: "Floot lets you build and publish web apps using AI. But its source code stays on Floot's servers. Push44 connects to Floot's API to export your complete project source code and push it to GitHub — giving you full ownership of your app.",
    problem: "Floot is a web app builder that publishes apps to the web, but it doesn't provide a native way to download or version-control your source code. Your project files — components, styles, logic — exist only within Floot's platform.",
    solution: "Push44 authenticates with Floot using a session token, reads your project's complete source file tree via Floot's reference API, and pushes all files to GitHub. The export includes all components, styles, and configuration exactly as they exist in Floot.",
    steps: [
      {
        title: "Get your Floot session token",
        content: "The Floot authentication uses a session token. Open Floot in your browser, open Developer Tools (F12), go to Application → Cookies, and find the session cookie. Copy its value. This is your Floot token for Push44.",
        tip: "Push44 also supports Floot's magic link authentication flow — if you have trouble with the cookie approach, try generating a magic link from Floot's login page.",
      },
      {
        title: "Connect Floot in Push44",
        content: "Open Push44 and select Floot as your platform. Paste your session token. Push44 verifies the token and loads your Floot workspace.",
      },
      {
        title: "Select your Floot project",
        content: "Push44 shows your Floot workspace and available projects. Select the app you want to export. Push44 reads the project's source file tree via the workspace reference API.",
      },
      {
        title: "Push to GitHub",
        content: "Enter your GitHub repository details and click 'Push to GitHub'. Push44 exports all your Floot source files — components, styles, routing, and configuration — to your GitHub repo.",
      },
    ],
    tips: [
      "Floot session tokens expire — if Push44 shows an auth error, get a fresh token from your browser cookies.",
      "Export before making major changes in Floot so you have a rollback point.",
    ],
    mistakes: [
      "Copying only part of the session cookie value — they can be quite long.",
      "Not refreshing the Floot token when it expires — check Push44's error message for auth issues.",
    ],
    faqs: [
      { question: "Does exporting Floot remove my app from Floot?", answer: "No. Push44 only reads your project. Your Floot app continues to run and be hosted by Floot normally." },
      { question: "Does the Floot export include published pages or just source code?", answer: "Push44 exports the source code — the actual files and components. The published/hosted version is separate and remains on Floot's servers." },
    ],
    related: ["export-floot-to-github", "floot-source-code-backup", "backup-ai-generated-apps"],
  },

  {
    slug: "export-floot-to-github",
    title: "Export Floot to GitHub — Complete Guide | Push44",
    h1: "Export Floot to GitHub",
    description: "Connect your Floot project to GitHub using Push44. Push your source code, track changes, and own your Floot app. Free, open source.",
    platform: "floot",
    category: "github",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-22",
    updatedAt: "2026-07-02",
    views: 6200,
    keywords: ["export floot to github", "floot github", "floot push to github", "floot git integration", "floot version control"],
    intro: "Floot builds your app but GitHub owns your history. Push44 connects the two — reading your Floot source code and creating proper git commits in any GitHub repository.",
    problem: "Floot doesn't have native GitHub integration. This means no CI/CD, no code review, no collaboration with non-Floot developers, and no rollback history.",
    solution: "Push44 bridges Floot and GitHub. It authenticates with both platforms and creates an atomic GitHub commit from your Floot project files.",
    steps: [
      { title: "Authenticate with Floot", content: "Enter your Floot session token in Push44. Select your workspace." },
      { title: "Choose your project", content: "Select the Floot app to export." },
      { title: "Configure GitHub", content: "Enter your GitHub token, username, and repo name. Push44 creates the repo if needed." },
      { title: "Push", content: "Click 'Push to GitHub'. Your Floot code appears as a commit in your GitHub repo within seconds." },
    ],
    tips: ["Export before publishing to Floot to maintain a source-of-truth backup."],
    mistakes: ["Using an expired Floot session token."],
    faqs: [
      { question: "Can I use my Floot export with any JavaScript framework?", answer: "Yes. Push44 exports the raw source files. If your Floot project uses React, the exported files are standard React components." },
    ],
    related: ["how-to-export-floot-project", "floot-source-code-backup", "github-version-control-for-ai-apps"],
  },

  {
    slug: "floot-source-code-backup",
    title: "Floot Source Code Backup Guide | Push44",
    h1: "How to Backup Your Floot Source Code",
    description: "Create complete backups of your Floot projects to GitHub with Push44. Protect your work from data loss and platform changes. Free.",
    platform: "floot",
    category: "backup",
    readTime: 4,
    difficulty: "beginner",
    publishedAt: "2026-06-24",
    updatedAt: "2026-07-02",
    views: 4800,
    keywords: ["floot backup", "backup floot project", "floot source code backup", "floot project backup", "save floot code"],
    intro: "Protect your Floot app investments with regular GitHub backups. Push44 makes it a 2-minute process to push your complete Floot source code to a safe, permanent location.",
    problem: "Your Floot app represents real time and creative investment. Without a backup, a platform outage, account issue, or accidental deletion could mean losing everything.",
    solution: "Push44 exports your complete Floot source code to GitHub on demand. Your backup is version-controlled, complete, and completely under your control.",
    steps: [
      { title: "Connect Push44 to Floot", content: "Authenticate with your Floot session token in Push44." },
      { title: "Export to a GitHub backup repo", content: "Create a dedicated backup repository in GitHub and push your Floot project to it." },
      { title: "Schedule regular backups", content: "Export after every meaningful development session. Monthly backups at minimum for active projects." },
    ],
    tips: ["Name your backup repos clearly: 'myapp-floot-backup-YYYY-MM'."],
    mistakes: ["Backing up once and never updating the backup."],
    faqs: [
      { question: "How complete is the Floot backup?", answer: "Push44 reads your complete project source file tree from Floot's API — all components, styles, logic, and configuration files are included." },
    ],
    related: ["how-to-export-floot-project", "export-floot-to-github", "backup-ai-generated-apps"],
  },

  // ── ZITE ─────────────────────────────────────────────────────────────────

  {
    slug: "how-to-export-zite-project",
    title: "How to Export a Zite Project | Push44 Guide",
    h1: "How to Export Your Zite Project",
    description: "Export your Zite project source code to GitHub using Push44. Complete guide, free, includes all templates and components.",
    platform: "zite",
    category: "export",
    readTime: 6,
    difficulty: "beginner",
    publishedAt: "2026-06-26",
    updatedAt: "2026-07-02",
    views: 5900,
    keywords: ["export zite project", "zite source code export", "download zite project", "zite github export", "zite code download"],
    intro: "Zite is an AI-powered app builder on the Fillout infrastructure. Push44 connects to Zite's server API to export your project's template files and push them to GitHub.",
    problem: "Zite projects contain sophisticated template files and component definitions. Without export capability, all that AI-generated structure stays inside Zite's platform.",
    solution: "Push44 authenticates with Zite using your session and CSRF tokens, fetches your project's complete snapshot template files, and pushes them to GitHub.",
    steps: [
      {
        title: "Get your Zite session credentials",
        content: "Open Zite in your browser. In Developer Tools (F12), go to Application → Cookies and find 'connect.sid' (your session ID) and 'fillout-csrf-token' (your CSRF token). Copy both.",
        tip: "Both tokens are needed together — Zite uses double-token CSRF protection.",
      },
      {
        title: "Connect Zite in Push44",
        content: "In Push44, select Zite and enter your session ID and CSRF token. Push44 proxies the Zite API through its dev server to avoid CORS issues.",
      },
      {
        title: "Select your Zite app",
        content: "Push44 loads your Zite workspace and apps. Select the app to export. Push44 reads the app's snapshot template — the complete file structure.",
      },
      {
        title: "Push to GitHub",
        content: "Configure your GitHub repository and push. All Zite template files are committed to your repo.",
      },
    ],
    tips: ["Zite tokens expire with your browser session — get fresh tokens if Push44 shows auth errors."],
    mistakes: ["Forgetting that Zite needs both the session AND CSRF token — entering only one will fail."],
    faqs: [
      { question: "What does the Zite export include?", answer: "The export includes your Zite app's snapshot template files — all the component definitions, layout configuration, and settings that make up your Zite app." },
    ],
    related: ["zite-github-export-guide", "backup-ai-generated-apps", "export-code-without-subscription"],
  },

  {
    slug: "zite-github-export-guide",
    title: "Zite to GitHub: Complete Export Guide | Push44",
    h1: "Zite GitHub Export Guide",
    description: "Push your Zite app source code to GitHub with Push44. Own your Zite project, enable version control, and back up your work. Free.",
    platform: "zite",
    category: "github",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-28",
    updatedAt: "2026-07-02",
    views: 4100,
    keywords: ["zite github export", "zite push to github", "zite github integration", "zite git", "zite version control"],
    intro: "Connecting Zite to GitHub opens your AI-built app to the full developer ecosystem — CI/CD, collaboration, and permanent version history. Push44 makes this connection in minutes.",
    problem: "Zite apps stay isolated from GitHub without a native export feature. This limits collaboration and makes version control impossible within Zite itself.",
    solution: "Push44 bridges Zite and GitHub using both platforms' APIs, creating proper git commits from your Zite project files.",
    steps: [
      { title: "Authenticate with Zite", content: "Enter your Zite session ID and CSRF token in Push44." },
      { title: "Select your app", content: "Choose the Zite app to export from your workspace." },
      { title: "Configure GitHub", content: "Enter your GitHub PAT, username, and repository name." },
      { title: "Push and verify", content: "Click 'Push to GitHub'. Check your GitHub repo to confirm the files are there." },
    ],
    tips: ["Use descriptive repo names to distinguish between your Zite projects on GitHub."],
    mistakes: ["Not having both the session and CSRF token — Zite authentication requires both."],
    faqs: [
      { question: "Can I export a Zite app to a private GitHub repository?", answer: "Yes. Use a GitHub PAT with 'repo' scope to push to private repositories." },
    ],
    related: ["how-to-export-zite-project", "github-version-control-for-ai-apps", "backup-ai-generated-apps"],
  },

  // ── GENERAL ───────────────────────────────────────────────────────────────

  {
    slug: "backup-ai-generated-apps",
    title: "How to Backup AI-Generated Apps — Complete Guide | Push44",
    h1: "How to Backup AI-Generated Apps",
    description: "Protect your AI-built apps with regular GitHub backups. Complete guide covering Base44, Rocket.new, Floot, and Zite. Free tool, no limits.",
    platform: "general",
    category: "backup",
    readTime: 7,
    difficulty: "beginner",
    publishedAt: "2026-06-01",
    updatedAt: "2026-07-02",
    views: 31200,
    keywords: ["backup ai generated apps", "backup ai apps", "ai app backup", "protect ai code", "ai project backup"],
    intro: "AI app builders like Base44, Rocket.new, Floot, and Zite let you build apps incredibly fast. But your creations live on their servers. A sudden platform change, account issue, or data loss event could wipe out months of work. Backing up to GitHub takes 2 minutes and protects everything.",
    problem: "Most AI app builders don't provide native export or backup features. Your app's source code lives exclusively on their platform. This creates three risks: (1) You lose access if you can't pay for the platform, (2) The platform could shut down or change terms, (3) There's no version history if AI generation goes wrong.",
    solution: "Push44 reads your project files directly from each platform's API and pushes them to GitHub. The process is identical for all four supported platforms. Once on GitHub, your code is safe, version-controlled, and completely platform-independent.",
    steps: [
      {
        title: "Choose which platform to back up first",
        content: "Start with your most important project. Push44 supports Base44, Rocket.new, Floot, and Zite. Pick the platform where you've invested the most time.",
      },
      {
        title: "Create a GitHub repository for backups",
        content: "In GitHub, create a new private repository for your project. A good naming convention is 'projectname-platform-backup' (e.g., 'myapp-base44-backup'). Initialize it without a README so the first push is clean.",
      },
      {
        title: "Connect your platform in Push44",
        content: "Open Push44 and select your platform. Enter the required credentials (API token for Base44, session tokens for Floot/Zite, API token + company ID for Rocket.new). Push44 loads your projects.",
      },
      {
        title: "Do your first backup export",
        content: "Select your project, enter your GitHub repository details, and click 'Push to GitHub'. This is your baseline backup — a complete snapshot of the current state.",
      },
      {
        title: "Set up a recurring backup schedule",
        content: "Commit to running Push44 after each development session, or at minimum once a week. Each export creates a new git commit, building a timeline of your project's history.",
        tip: "Set a phone reminder every week that says 'Export to GitHub' until it becomes habit.",
      },
    ],
    tips: [
      "Back up all your AI projects, not just the ones you're actively developing.",
      "Keep backup repos private to protect your intellectual property.",
      "Consider tagging important commits in GitHub (e.g., 'v1.0', 'before-redesign') for easy reference.",
      "Push44 shows a file count after each export — verify the count stays consistent to ensure all files are included.",
    ],
    mistakes: [
      "Only backing up once and never updating — your backup becomes useless as the project evolves.",
      "Using a public repo for sensitive business logic — keep backups private unless intentionally open-sourcing.",
      "Not verifying that the backup is complete — spot-check a few files in GitHub after each export.",
    ],
    faqs: [
      { question: "Can I backup multiple AI platforms to the same GitHub repo?", answer: "Yes, but we recommend separate repos per project/platform for clarity. Mixing Base44 and Rocket.new files in one repo makes history harder to read." },
      { question: "How much does it cost to backup AI apps with Push44?", answer: "Push44 is completely free and open source. GitHub gives you unlimited private repos on free accounts. There is zero cost." },
      { question: "What if the AI platform goes out of business?", answer: "If you have regular GitHub backups, you have all your source code. You can run it locally, migrate it to another platform, or host it yourself." },
      { question: "Does Push44 backup the database or just the code?", answer: "Push44 backs up source code files. For database data, you would need to export from the AI platform's data tools separately." },
    ],
    related: ["how-to-export-code-from-base44", "github-version-control-for-ai-apps", "ai-project-backup-best-practices", "export-code-without-subscription"],
  },

  {
    slug: "github-version-control-for-ai-apps",
    title: "GitHub Version Control for AI-Generated Apps | Push44 Guide",
    h1: "GitHub Version Control for AI-Generated Apps",
    description: "Add Git version control to any AI-built app. Track every change, collaborate with developers, and own your history. Works with Base44, Rocket.new, Floot, Zite.",
    platform: "general",
    category: "version-control",
    readTime: 9,
    difficulty: "intermediate",
    publishedAt: "2026-06-05",
    updatedAt: "2026-07-02",
    views: 24600,
    keywords: ["github version control ai apps", "git for ai apps", "version control ai generated code", "ai app git history", "ai code version control"],
    intro: "Git version control is the backbone of professional software development. But AI app builders exist in a world where code is generated, not written — and most platforms don't integrate with Git at all. Push44 bridges this gap, giving your AI-generated apps a proper, professional Git history.",
    problem: "AI platforms generate code constantly. Every prompt changes files, sometimes in unexpected ways. Without version control, you have no way to compare what changed, undo a bad generation, or understand how your project evolved over time. You're flying blind.",
    solution: "Push44 creates real Git commits from your AI platform projects. Each time you export, a commit is created capturing the exact state of every file. Over time, you get a timeline showing the complete evolution of your AI-built app.",
    steps: [
      {
        title: "Understand the Push44 export model",
        content: "Push44 works by reading your complete project from the AI platform's API and pushing to GitHub using the Git Tree API. Each push creates one commit. The commit delta shows exactly what changed since your last push.",
      },
      {
        title: "Establish your first baseline commit",
        content: "Before your next AI generation session, do your first Push44 export. This baseline commit becomes the 'before' state. After you run AI generations, export again — the diff shows exactly what the AI changed.",
        tip: "This 'before/after AI generation' commit pattern is extremely useful for understanding what AI modifications actually did to your codebase.",
      },
      {
        title: "Use Git branches for experiments",
        content: "When trying a major new direction in your AI app, create a new GitHub branch before your first push to that branch. Name it descriptively (e.g., 'experiment-new-ui', 'try-dark-mode'). If the experiment fails, you still have the main branch intact.",
      },
      {
        title: "Write meaningful commit context",
        content: "Push44 creates commits with the file diff. Use your GitHub repo's description or a CHANGELOG.md file to document what each session's changes represent. Future you will appreciate the context.",
      },
      {
        title: "Use GitHub's comparison tools",
        content: "On GitHub, you can compare any two commits by modifying the URL: github.com/username/repo/compare/abc123..def456. This shows every line that changed between the two AI generation sessions.",
      },
    ],
    tips: [
      "Export before AND after major AI prompts to get precise before/after diffs.",
      "Git blame in GitHub shows which commit introduced each line — useful for debugging AI-generated code.",
      "GitHub's 'Releases' feature lets you mark important milestones (v1.0, first-demo) in your project history.",
      "Use branch protection rules in GitHub to prevent accidental force-pushes to your main branch.",
    ],
    mistakes: [
      "Waiting weeks between exports — this creates massive commits that are hard to understand or roll back from.",
      "Using generic branch names like 'test' or 'backup' — be specific about what you're branching for.",
    ],
    faqs: [
      { question: "Can I use standard Git commands with my Push44 exports?", answer: "Yes. Once your code is in GitHub, it's standard Git. You can clone it, create branches, merge, cherry-pick, rebase — all standard Git operations work." },
      { question: "Does Push44 support Git submodules?", answer: "No. Push44 creates flat file trees in your repository. If your AI project generates submodule references, they're pushed as regular files." },
      { question: "Can I set up CI/CD from Push44 exports?", answer: "Yes. GitHub Actions triggers on every push, including pushes from Push44. You can run tests, deployments, or any automation on every export." },
      { question: "What's the difference between Push44 exports and a real git commit?", answer: "From GitHub's perspective, there's no difference. Push44 uses the GitHub Git Tree API to create proper commits with parents, trees, and blobs — exactly as if a developer had run 'git add . && git commit && git push'." },
    ],
    related: ["backup-ai-generated-apps", "base44-version-control-guide", "how-to-export-code-from-base44", "ai-code-ownership-guide"],
  },

  {
    slug: "export-code-without-subscription",
    title: "Export AI-Generated Code Without a Subscription | Push44",
    h1: "How to Export AI Code Without a Subscription",
    description: "Export your AI-built app source code for free — no subscription required. Push44 bypasses export restrictions on Base44, Rocket.new, Floot, and Zite.",
    platform: "general",
    category: "export",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-08",
    updatedAt: "2026-07-02",
    views: 42100,
    keywords: ["export ai code without subscription", "free ai code export", "bypass ai platform paywall", "export code free", "download ai code free"],
    intro: "Many AI coding platforms gate code export behind paid subscriptions. You build the app, but downloading your own source code costs extra. Push44 bypasses these restrictions using the same API the platforms use internally — giving you your code for free, forever.",
    problem: "Platforms like Base44, Rocket.new, and others charge subscription fees partly justified by providing code export. Without paying, you can view your code in the browser but can't download it cleanly. This creates a lock-in: stop paying, lose access to your own work.",
    solution: "Push44 reads your project files using the same APIs that power these platforms' own editors. These APIs are accessible to all users — not just paying subscribers. Push44 is free, open source, and has no subscription of its own.",
    steps: [
      { title: "Install nothing — Push44 runs in the browser", content: "Go to push44.vercel.app. There's nothing to install. Push44 is a web app that makes direct API calls from your browser." },
      { title: "Get free credentials", content: "You need a free API token from your AI platform (available to all account tiers) and a free GitHub Personal Access Token. Both are free." },
      { title: "Export your project", content: "Select your platform, enter your tokens, choose your project, and click 'Push to GitHub'. Your complete source code is now in GitHub — permanently, for free." },
    ],
    tips: [
      "Push44 is open source — you can verify exactly what it does with your credentials at github.com/The-habib/Push44.",
      "Your credentials are stored in your browser only — never on any Push44 server.",
    ],
    mistakes: ["Assuming export requires a paid tier on the AI platform — it does not."],
    faqs: [
      { question: "Is Push44 legal to use for exporting AI app code?", answer: "Yes. Push44 uses the same APIs that the platforms expose to their users. It authenticates with your own credentials and reads your own project files." },
      { question: "Will using Push44 get my account banned?", answer: "No. Push44 uses the same API calls that the platforms' own editors make. It's not scraping or bypassing security — it's using the documented API." },
      { question: "Why do AI platforms charge for code export?", answer: "Code export is often used as a premium differentiator to encourage upgrades. However, the underlying API access is usually available to all users — platforms just don't surface the export UI to free users." },
    ],
    related: ["how-to-export-code-from-base44", "backup-ai-generated-apps", "ai-code-ownership-guide", "free-ai-code-export-tools"],
  },

  {
    slug: "ai-code-ownership-guide",
    title: "How to Own Your AI-Generated Source Code | Push44 Guide",
    h1: "The Complete Guide to AI Code Ownership",
    description: "Own 100% of your AI-generated source code. Export, backup, and version-control apps built with any AI platform. No subscription. No lock-in.",
    platform: "general",
    category: "open-source",
    readTime: 8,
    difficulty: "beginner",
    publishedAt: "2026-06-10",
    updatedAt: "2026-07-02",
    views: 19800,
    keywords: ["ai code ownership", "own ai generated code", "ai source code ownership", "ai app ownership", "own your ai code"],
    intro: "When AI generates your code, who owns it? Legally, you do. But practically, if it lives on a platform you don't control, you don't truly own it. Real code ownership means having your source code in a location you control — like GitHub — independent of any AI platform.",
    problem: "AI-built apps create a new kind of lock-in. You own the idea, you directed the AI, you made the product decisions — but the code sits on the AI platform's servers. If you stop paying, they can restrict access. If they shut down, your work is gone.",
    solution: "True ownership means having the source code on your own GitHub account. Push44 makes this possible for any AI platform: your code moves from their servers to your GitHub in minutes. From there, it's truly yours — independent, permanent, and portable.",
    steps: [
      { title: "Understand what you're exporting", content: "AI platform code is standard source code — React components, Node.js APIs, CSS, configuration files. It's your code even though AI generated it. Push44 exports it as standard files." },
      { title: "Create your code ownership repository", content: "On GitHub, create a repo specifically for your AI-generated project. Keep it private to protect your work, or public if you want to share it as open source." },
      { title: "Do your first ownership export", content: "Use Push44 to push your project from the AI platform to your GitHub repo. Once it's there, it's yours — the AI platform has no more claim to it." },
      { title: "Build an ownership habit", content: "Export after every session. This keeps your GitHub repo as the authoritative source of your project, not the AI platform." },
    ],
    tips: [
      "Consider adding a LICENSE file to your exported GitHub repo to formally assert your copyright.",
      "README your projects in GitHub — document what the app does, the tech stack, and how to run it.",
      "True ownership means being able to run your code independently. Test this by cloning and running your exported code locally.",
    ],
    mistakes: [
      "Assuming platform terms give you ownership — most AI platforms grant you license to your outputs, but the practical ownership only materializes when you have the code elsewhere.",
    ],
    faqs: [
      { question: "Do I legally own AI-generated code?", answer: "In most jurisdictions, AI-generated code you directed the creation of is legally yours. Push44 helps you exercise this ownership by giving you the files." },
      { question: "Can I sell or license my AI-generated code?", answer: "Yes, in most cases. Check your AI platform's terms of service for specifics, but generally you retain intellectual property rights to outputs you create." },
      { question: "What if I want to open source my AI-built app?", answer: "Export with Push44, make the GitHub repo public, add an open source license (MIT is common), and you're done. Your AI-built app is now open source." },
    ],
    related: ["export-code-without-subscription", "backup-ai-generated-apps", "github-version-control-for-ai-apps"],
  },

  {
    slug: "free-ai-code-export-tools",
    title: "Free AI Code Export Tools: Complete Comparison 2025 | Push44",
    h1: "Free AI Code Export Tools — 2025 Comparison",
    description: "Compare free tools for exporting AI-generated code to GitHub. Push44 vs manual methods vs zip downloads. Find the best approach for Base44, Rocket.new, Floot, Zite.",
    platform: "general",
    category: "comparisons",
    readTime: 7,
    difficulty: "beginner",
    publishedAt: "2026-06-12",
    updatedAt: "2026-07-02",
    views: 16400,
    keywords: ["free ai code export tools", "ai code export tool", "best ai export tool", "free ai github export", "ai code download tool"],
    intro: "Several approaches exist for exporting code from AI app builders. This guide compares all of them honestly — including their limitations — so you can choose the right method for your situation.",
    problem: "You have AI-generated code that needs to leave the platform. The options range from manual copy-paste to specialized tools like Push44. Each has different trade-offs in terms of completeness, effort, and maintenance.",
    solution: "Push44 is the most complete automated option: it fetches all files, preserves directory structure, creates proper git commits, and works with 4 major AI platforms. But here's an honest comparison of all available approaches.",
    steps: [
      { title: "Manual copy-paste", content: "Copy each file individually from the AI platform editor. Pros: No tools needed. Cons: Tedious for 30+ file projects, easy to miss files, no git commit, no version history. Best for: one-time exports of very small projects (< 5 files)." },
      { title: "Browser DevTools download", content: "Use browser DevTools to intercept API calls and manually download file responses. Pros: Works for any platform. Cons: Requires technical knowledge, error-prone, no automation. Best for: developers comfortable with DevTools who need a one-off export." },
      { title: "Platform ZIP export (where available)", content: "Some AI platforms offer a ZIP download option, sometimes behind a paywall. Pros: Officially supported. Cons: Often requires paid subscription, no git commit, no version history. Best for: users with paid subscriptions who only need one-time exports." },
      { title: "Push44 (free, automated)", content: "Automated export via platform APIs → GitHub. Pros: Free, complete, creates git commits, works across 4 platforms, version history, ZIP option. Cons: Requires initial setup (API tokens). Best for: anyone who wants reliable, automated, version-controlled exports.", tip: "Push44 is the only option that creates real git commits with proper version history." },
    ],
    tips: ["Use Push44 for regular exports and manual methods only as a fallback.", "Test your export method by checking the file count — it should match what you see in the AI platform's editor."],
    mistakes: ["Relying on manual copy-paste for projects with more than 10 files — you'll inevitably miss something."],
    faqs: [
      { question: "Is Push44 really free?", answer: "Yes. Push44 is 100% free and open source (MIT license). There are no paid tiers, no subscription fees, and no per-export charges." },
      { question: "Why would I use Push44 over a platform's built-in export?", answer: "Push44 creates git commits (giving you version history), works across 4 platforms with the same interface, is always free, and exports complete file trees without paywall restrictions." },
    ],
    related: ["export-code-without-subscription", "ai-code-ownership-guide", "backup-ai-generated-apps"],
  },

  {
    slug: "ai-project-backup-best-practices",
    title: "AI Project Backup Best Practices — 2025 Guide | Push44",
    h1: "AI Project Backup Best Practices",
    description: "Best practices for backing up AI-generated apps to GitHub. Frequency, organization, naming conventions, and recovery testing. Free guide.",
    platform: "general",
    category: "backup",
    readTime: 6,
    difficulty: "intermediate",
    publishedAt: "2026-06-15",
    updatedAt: "2026-07-02",
    views: 11200,
    keywords: ["ai project backup best practices", "backup ai apps best practices", "ai code backup guide", "how to backup ai projects", "ai project protection"],
    intro: "A backup that isn't tested is just a false sense of security. This guide covers not just how to back up your AI projects, but how to do it right — with the right frequency, naming, and verification steps.",
    problem: "Most developers back up their AI projects either too infrequently, too inconsistently, or without ever testing the recovery process. When disaster strikes, they discover the backup is outdated or incomplete.",
    solution: "Follow these battle-tested backup best practices. The core rule: back up often, name clearly, verify regularly, and test recovery before you need it.",
    steps: [
      { title: "Choose the right backup frequency", content: "For active projects: export after every meaningful session (daily or every other day). For stable projects: weekly at minimum. For archived projects: one final export, then lock the repo." },
      { title: "Use a clear naming convention", content: "GitHub repo names like 'projectname-platform-backup' are easy to find later. Add a description to each repo explaining what the project does. Use GitHub repo topics ('base44', 'backup', project-type keywords)." },
      { title: "Write a CHANGELOG", content: "Add a CHANGELOG.md to your repo and update it with each Push44 export. Note what changed in that session. This creates a human-readable history alongside the git diffs." },
      { title: "Test your recovery process", content: "At least once, clone your backup repo and try to run the project. Verify all files are there and the project is functional. If you can't run it from the export, your backup might be missing something.", tip: "Set a reminder to test recovery every 3 months for any critical project." },
      { title: "Organize your backups", content: "Create a GitHub organization or use GitHub's starred repos feature to organize all your AI project backups. A naming convention like 'org/projectname-platform' makes searching easy." },
    ],
    tips: [
      "Export before AND after every major AI generation session — gives you a clear before/after record.",
      "Use GitHub's 'Archive this repository' feature for completed projects to prevent accidental changes.",
      "Keep your GitHub Personal Access Token secure — it gives write access to all your repos.",
    ],
    mistakes: [
      "Not testing the backup — the only way to know a backup works is to restore from it.",
      "Backing up to a single location — consider having both GitHub and a local clone.",
      "Using generic backup repo names — you'll forget which is which in 6 months.",
    ],
    faqs: [
      { question: "How do I know my backup is complete?", answer: "Check the file count in Push44 before and after export. It should show all files from your project. Also verify in GitHub that key files (your main source files, package.json, etc.) are present." },
      { question: "Should I keep all old backups or just the latest?", answer: "Keep all of them in git history — git is designed for this. Old commits don't take significant extra storage and give you the ability to roll back to any point." },
    ],
    related: ["backup-ai-generated-apps", "github-version-control-for-ai-apps", "how-to-export-code-from-base44"],
  },

  // ── TROUBLESHOOTING ────────────────────────────────────────────────────────

  {
    slug: "push44-export-failed-fix",
    title: "Push44 Export Failed? How to Fix Common Errors | Push44",
    h1: "Push44 Export Failed — How to Fix It",
    description: "Fix the most common Push44 export errors: expired tokens, sleeping containers, permission issues, and rate limits. Step-by-step troubleshooting guide.",
    platform: "general",
    category: "troubleshooting",
    readTime: 7,
    difficulty: "beginner",
    publishedAt: "2026-06-16",
    updatedAt: "2026-07-02",
    views: 9800,
    keywords: ["push44 export failed", "push44 error", "fix ai export error", "github push failed ai", "push44 troubleshooting"],
    intro: "Push44 shows the exact error whenever something goes wrong — it never fails silently. This guide walks through the most common error messages and exactly how to resolve each one.",
    problem: "Exports can fail for a handful of predictable reasons: an expired or malformed token, a sleeping platform container, insufficient GitHub permissions, or hitting an API rate limit. Without knowing what each error means, it's easy to get stuck.",
    solution: "Match the error message you're seeing to the fixes below. Most Push44 errors are caused by credentials, not by Push44 itself, so re-checking your tokens resolves the vast majority of failures.",
    steps: [
      { title: "\"401 Unauthorized\" or \"Bad credentials\"", content: "Your platform token or GitHub token has expired or was typed incorrectly. Regenerate the token from the platform's settings page and re-paste it into Push44 — don't reuse an old token from clipboard history." },
      { title: "\"404 Not Found\" on GitHub push", content: "The repository name doesn't exist and Push44 couldn't create it, usually because your GitHub PAT is missing the 'repo' scope. Regenerate your token at github.com/settings/tokens with the full 'repo' scope checked." },
      { title: "\"Container is sleeping\" (Rocket.new)", content: "Rocket.new puts inactive project containers to sleep. Open the project directly in Rocket.new's editor to wake it, wait about 15 seconds, then retry the export in Push44." },
      { title: "\"Rate limit exceeded\"", content: "GitHub's API allows 5,000 authenticated requests per hour. This is rarely hit by normal use, but if you're exporting very large projects repeatedly, wait an hour or use a token with a higher rate limit tier." },
      { title: "\"Session expired\" (Floot or Zite)", content: "Session-based tokens (Floot, Zite) expire after a period of inactivity. Log back into the platform in your browser, copy a fresh session cookie value, and update it in Push44's credentials screen." },
    ],
    tips: [
      "Copy tokens directly — never retype them by hand, as a single wrong character causes silent auth failures.",
      "If an export fails midway, no partial commit is created — GitHub Trees API pushes are atomic, so your repo is never left in a broken state.",
      "Check the browser console (F12) for the raw API error if Push44's message isn't specific enough.",
    ],
    mistakes: [
      "Assuming a failed export means data loss — Push44 never writes anything until the full commit is ready.",
      "Retrying immediately without fixing the underlying token issue — this just repeats the same error.",
      "Using a fine-grained GitHub PAT without repository access explicitly granted to the target repo.",
    ],
    faqs: [
      { question: "Does a failed Push44 export corrupt my GitHub repo?", answer: "No. Push44 uses the GitHub Trees API, which builds the entire commit before updating the branch reference. If any step fails, nothing is written to your repo." },
      { question: "Why does Push44 say my token is invalid right after I generated it?", answer: "Some platforms take a few seconds to activate new tokens. Wait 10-15 seconds after generating a token before using it in Push44." },
      { question: "Can I retry a failed export without redoing everything?", answer: "Yes. Push44 keeps your session credentials and project selection — just fix the underlying issue and click 'Push to GitHub' again." },
    ],
    related: ["backup-ai-generated-apps", "how-to-export-rocket-new-project", "how-to-export-floot-project"],
  },

  {
    slug: "github-token-permission-errors",
    title: "GitHub Token Permission Errors — Fix Guide | Push44",
    h1: "Fixing GitHub Token Permission Errors",
    description: "Understand and fix GitHub Personal Access Token permission errors when pushing AI-generated code with Push44. Correct scopes explained.",
    platform: "general",
    category: "troubleshooting",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-17",
    updatedAt: "2026-07-02",
    views: 7100,
    keywords: ["github token permission error", "github pat scope", "repo scope github token", "fix github 403 error", "github token not working"],
    intro: "GitHub Personal Access Tokens (PATs) are scoped — meaning a token only has the permissions you explicitly granted it. Permission errors are the single most common reason a Push44 export fails.",
    problem: "Many users create a GitHub token with default or minimal scopes, then wonder why Push44 can't create a repository or push to a private one. GitHub's fine-grained tokens make this even easier to get wrong.",
    solution: "For classic tokens, always select the full 'repo' checkbox. For fine-grained tokens, explicitly grant 'Contents: Read and write' and 'Administration: Read and write' (if you want Push44 to create new repos) on the specific repository or account.",
    steps: [
      { title: "Go to GitHub token settings", content: "Navigate to github.com/settings/tokens (classic) or github.com/settings/personal-access-tokens (fine-grained)." },
      { title: "For classic tokens: check 'repo'", content: "Select the top-level 'repo' checkbox, which includes all sub-scopes (repo:status, repo_deployment, public_repo, repo:invite). This is required for private repositories." },
      { title: "For fine-grained tokens: set repository access", content: "Choose 'All repositories' or select the specific repo you'll push to. Under permissions, set 'Contents' to Read and write." },
      { title: "Regenerate and re-paste", content: "Copy the new token immediately (GitHub only shows it once) and paste it into Push44's GitHub token field, replacing the old one." },
    ],
    tips: [
      "Classic tokens are simpler for most Push44 use cases — fine-grained tokens are more secure but require careful scope selection.",
      "Set a token expiration reminder — expired tokens are the most common cause of 'sudden' export failures.",
    ],
    mistakes: [
      "Selecting only 'public_repo' when pushing to a private repository.",
      "Creating a fine-grained token scoped to the wrong repository.",
      "Forgetting that GitHub only displays a new token once — losing it means starting over.",
    ],
    faqs: [
      { question: "What's the difference between classic and fine-grained GitHub tokens?", answer: "Classic tokens grant broad access based on checkbox scopes (like 'repo'). Fine-grained tokens let you restrict access to specific repositories and specific permissions, which is more secure but requires more careful setup." },
      { question: "Which token type should I use with Push44?", answer: "Either works. Classic tokens with the 'repo' scope are simpler to set up. Fine-grained tokens are recommended if you want to limit Push44's access to a single repository." },
    ],
    related: ["push44-export-failed-fix", "how-to-export-code-from-base44", "github-version-control-for-ai-apps"],
  },

  // ── TUTORIALS ──────────────────────────────────────────────────────────────

  {
    slug: "connect-github-to-push44-tutorial",
    title: "How to Connect GitHub to Push44 — Full Tutorial | Push44",
    h1: "How to Connect GitHub to Push44",
    description: "Complete tutorial for connecting your GitHub account to Push44 using a Personal Access Token, including screenshots of every setting you need.",
    platform: "general",
    category: "tutorials",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-18",
    updatedAt: "2026-07-02",
    views: 8600,
    keywords: ["connect github to push44", "push44 github setup", "github personal access token tutorial", "push44 tutorial", "how to use push44"],
    intro: "Connecting GitHub is the first step to using Push44 with any AI platform. This tutorial walks through creating a Personal Access Token and pairing it with Push44 in under three minutes.",
    problem: "First-time users often aren't sure which GitHub token type to create, which scopes to select, or where to paste it in Push44 — leading to confusing permission errors on the first export attempt.",
    solution: "Follow these steps exactly once. After the initial setup, Push44 remembers your token in your browser's localStorage, so you won't need to repeat this for future exports (unless you clear browser data or the token expires).",
    steps: [
      { title: "Open GitHub token settings", content: "Sign in to GitHub, then go to Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token." },
      { title: "Name and scope your token", content: "Give it a descriptive name like 'push44-export'. Set an expiration (90 days is a good default). Check the 'repo' scope box — this grants read/write access to your repositories." },
      { title: "Generate and copy the token", content: "Click 'Generate token' at the bottom of the page. GitHub shows the token once — copy it immediately with the copy icon." },
      { title: "Paste it into Push44", content: "Open push44.vercel.app, go through onboarding or settings, and paste the token into the 'GitHub Personal Access Token' field." },
      { title: "Verify the connection", content: "Push44 makes a test call to the GitHub API to confirm the token works and shows your GitHub username once connected successfully." },
    ],
    tips: [
      "Set a calendar reminder before your token's expiration date so exports don't suddenly break.",
      "You can create a Push44-specific token and revoke it anytime from GitHub without affecting any other apps.",
    ],
    mistakes: [
      "Closing the token page before copying it — GitHub will not show the value again.",
      "Pasting a token with extra whitespace — always paste directly without trailing spaces.",
    ],
    faqs: [
      { question: "Is a Personal Access Token safe to use with Push44?", answer: "Yes. Push44 stores it only in your browser's localStorage and uses it exclusively to call the GitHub API directly from your browser." },
      { question: "Can I revoke the token later?", answer: "Yes, at any time from GitHub's token settings page. Revoking it immediately stops Push44 (or any other app using it) from accessing your GitHub account." },
    ],
    related: ["how-to-export-code-from-base44", "github-token-permission-errors", "github-version-control-for-ai-apps"],
  },

  {
    slug: "create-first-github-repo-from-ai-app",
    title: "Create Your First GitHub Repo from an AI App | Push44 Tutorial",
    h1: "Create Your First GitHub Repo from an AI-Built App",
    description: "Tutorial for turning your Base44, Rocket.new, Floot, or Zite project into a real GitHub repository with full version history, step by step.",
    platform: "general",
    category: "tutorials",
    readTime: 6,
    difficulty: "beginner",
    publishedAt: "2026-06-19",
    updatedAt: "2026-07-02",
    views: 6400,
    keywords: ["create github repo from ai app", "first github repo ai project", "turn ai app into github repo", "ai app version control tutorial"],
    intro: "If you've never created a GitHub repository before, exporting your first AI-built app with Push44 is a great way to learn — the whole process happens through Push44's UI without needing the git command line.",
    problem: "Beginners are often intimidated by git and GitHub, assuming they need to learn command-line git before they can version-control their AI-built app.",
    solution: "Push44 handles all git operations internally through GitHub's API. You never need to install git or run a command — you just need a GitHub account and your AI platform credentials.",
    steps: [
      { title: "Create a free GitHub account", content: "If you don't have one, sign up at github.com — it's free for unlimited public and private repositories." },
      { title: "Generate a Personal Access Token", content: "Follow the token creation steps (see our GitHub connection tutorial) and copy your token." },
      { title: "Connect your AI platform in Push44", content: "Choose Base44, Rocket.new, Floot, or Zite, and enter the credentials for that platform." },
      { title: "Type a new repository name", content: "In Push44's repo field, type a name that doesn't exist yet, like 'my-first-ai-app'. Push44 will create it automatically as part of the push." },
      { title: "Push and view your repo", content: "Click 'Push to GitHub'. Once complete, click the link Push44 provides to view your brand-new repository with all your project files and a first commit." },
    ],
    tips: [
      "Start with a private repository if your app contains sensitive data or API keys.",
      "Add a README.md to your new repo afterward describing what the app does — future you will thank you.",
    ],
    mistakes: [
      "Reusing an existing repo name that already contains unrelated files — this can create merge conflicts.",
      "Skipping the diff review step, which shows you exactly what's about to be committed.",
    ],
    faqs: [
      { question: "Do I need to know git commands to use Push44?", answer: "No. Push44 handles everything through GitHub's API — no git installation or command-line knowledge required." },
      { question: "Can I keep pushing updates to the same repo?", answer: "Yes. Every time you make changes in your AI platform, run Push44 again pointing at the same repo — it creates a new commit with just the changes." },
    ],
    related: ["connect-github-to-push44-tutorial", "how-to-export-code-from-base44", "backup-ai-generated-apps"],
  },

  // ── FLOOT (deeper coverage) ────────────────────────────────────────────────

  {
    slug: "floot-magic-link-token-guide",
    title: "How to Get Your Floot Session Token via Magic Link | Push44",
    h1: "Getting Your Floot Session Token",
    description: "Step-by-step guide to retrieving your Floot session token through the magic link login flow, so you can connect Floot to Push44 for GitHub export.",
    platform: "floot",
    category: "export",
    readTime: 5,
    difficulty: "intermediate",
    publishedAt: "2026-06-20",
    updatedAt: "2026-07-02",
    views: 4900,
    keywords: ["floot session token", "floot magic link login", "floot api token", "connect floot to push44", "floot authentication"],
    intro: "Floot doesn't expose a public API token in its settings UI, so Push44 authenticates using your active browser session instead. This guide shows exactly how to retrieve that session value.",
    problem: "Because Floot only supports magic-link email authentication (no password, no visible API token), first-time users aren't sure how to give Push44 access to their account.",
    solution: "After logging into Floot via the magic link sent to your email, your browser holds a signed session token. Push44 asks you to copy this value from your browser's developer tools once, then reuses it for exports until it expires.",
    steps: [
      { title: "Log into Floot", content: "Go to floot.com and enter your email to receive a magic link. Click the link in your inbox to complete login." },
      { title: "Open browser developer tools", content: "Once logged in, press F12 (or Cmd+Option+I on Mac) to open developer tools, then go to the Application (Chrome) or Storage (Firefox) tab." },
      { title: "Find the session cookie or token", content: "Look under Cookies for floot.com and find the session token value as instructed in Push44's connection screen." },
      { title: "Paste into Push44", content: "Copy the full token value and paste it into Push44's Floot token field. Push44 validates it immediately by fetching your workspace list." },
    ],
    tips: [
      "Session tokens expire after a period of inactivity — if Push44 suddenly can't connect, repeat this process to get a fresh token.",
      "Never share this token publicly — it grants the same access as being logged into your Floot account.",
    ],
    mistakes: [
      "Copying only part of the token value — session tokens (JWTs) are long and easy to truncate accidentally.",
      "Using an expired token from a previous session.",
    ],
    faqs: [
      { question: "Why doesn't Floot have a simple API key like other platforms?", answer: "Floot currently has no public developer API — Push44 works around this using your authenticated browser session, the same way your own browser talks to Floot." },
      { question: "Is it safe to use my Floot session token in Push44?", answer: "Yes. It's stored only in your browser's localStorage and used solely to call Floot's API directly from your browser to read your project files." },
    ],
    related: ["how-to-export-floot-project", "export-floot-to-github", "floot-source-code-backup"],
  },

  {
    slug: "floot-badge-removal-guide",
    title: "How to Remove the 'Made with Floot' Badge | Push44 Guide",
    h1: "Removing the Floot Badge from Your App",
    description: "Guide to removing the 'Made with Floot' badge from your published Floot app, and why exporting to GitHub with Push44 gives you full control over your app's branding.",
    platform: "floot",
    category: "tutorials",
    readTime: 4,
    difficulty: "intermediate",
    publishedAt: "2026-06-21",
    updatedAt: "2026-07-02",
    views: 3700,
    keywords: ["remove made with floot badge", "floot badge removal", "floot white label", "floot custom branding"],
    intro: "Floot adds a small 'Made with Floot' badge to published apps by default. This guide explains your options for removing it, including exporting your code with Push44 for full control.",
    problem: "The default badge is fine for prototypes, but many builders want a fully white-labeled app before sharing it with customers or clients.",
    solution: "Once you export your Floot project's source code to GitHub with Push44, you own the actual markup and styling — meaning you can remove or customize the badge exactly as you'd edit any other piece of your app's HTML/CSS.",
    steps: [
      { title: "Export your Floot project with Push44", content: "Connect your Floot session token and push your project's full source code to a GitHub repository." },
      { title: "Locate the badge markup", content: "Search your exported code for the badge component — it's typically a fixed-position element injected near the root of your app layout." },
      { title: "Remove or restyle it", content: "Delete the badge component, or restyle it to match your brand, directly in your codebase." },
      { title: "Deploy your customized version", content: "Since you now have the full source code in GitHub, you can deploy it anywhere — Vercel, Netlify, or your own infrastructure — without the badge." },
    ],
    tips: [
      "Check Floot's terms of service regarding badge removal on apps still hosted directly on Floot's infrastructure.",
      "Exporting with Push44 is the cleanest way to get pixel-level control over every part of your app's UI.",
    ],
    mistakes: [
      "Trying to hide the badge with CSS overrides inside Floot's own editor, which can be fragile and get reset on republish.",
    ],
    faqs: [
      { question: "Does removing the badge violate Floot's terms?", answer: "This depends on Floot's current terms of service and your plan — always check Floot's own policies before making branding changes to apps hosted on their platform." },
      { question: "Is badge removal easier after exporting to GitHub?", answer: "Yes. Once your code lives in your own GitHub repo and you deploy it independently, you have full control over every element, including any injected badges." },
    ],
    related: ["how-to-export-floot-project", "export-floot-to-github", "floot-magic-link-token-guide"],
  },

  // ── ZITE (deeper coverage) ─────────────────────────────────────────────────

  {
    slug: "zite-csrf-token-guide",
    title: "How to Find Your Zite CSRF and Session Token | Push44", 
    h1: "Finding Your Zite CSRF and Session Token",
    description: "Guide to locating the session ID and CSRF token Zite uses for authentication, so you can connect Zite to Push44 and export your app to GitHub.",
    platform: "zite",
    category: "export",
    readTime: 5,
    difficulty: "intermediate",
    publishedAt: "2026-06-22",
    updatedAt: "2026-07-02",
    views: 3100,
    keywords: ["zite csrf token", "zite session id", "zite api authentication", "connect zite to push44"],
    intro: "Zite (built on the Fillout infrastructure) protects its API with double-token CSRF security, meaning you need both a session cookie and a CSRF token to authenticate. This guide shows where to find both.",
    problem: "Zite has no public developer settings page for generating an API key, which confuses users trying to connect third-party tools like Push44.",
    solution: "Both required values are present in your browser once you're logged into Zite. Push44's connection screen tells you exactly which cookie names to look for.",
    steps: [
      { title: "Log into your Zite app editor", content: "Go to build.fillout.com and open the Zite app you want to export." },
      { title: "Open developer tools", content: "Press F12 and go to the Application/Storage tab, then Cookies for the Zite domain." },
      { title: "Copy the session ID", content: "Find the session cookie value as labeled in Push44's connection form and copy it exactly." },
      { title: "Copy the CSRF token", content: "Find the CSRF cookie value in the same list and copy it as the second credential." },
      { title: "Paste both into Push44", content: "Enter both values into their respective fields in Push44's Zite connection screen, then continue to select your app." },
    ],
    tips: [
      "Both tokens are tied to your current login session — if you log out of Zite, you'll need to grab fresh values.",
      "Keep both values private; together they can authenticate as you on Zite.",
    ],
    mistakes: [
      "Mixing up the session ID and CSRF token fields — Push44 needs both in the correct field.",
      "Copying a stale value from an old browser tab that's since logged out.",
    ],
    faqs: [
      { question: "Why does Zite need two separate tokens?", answer: "This is a standard CSRF-protection pattern: the session cookie identifies you, and the CSRF token proves the request came from an authorized page, preventing cross-site request forgery." },
      { question: "What exactly does Push44 export from Zite?", answer: "Push44 reads your app's full snapshot template — every component, layout, and configuration setting — and pushes it to GitHub as source files." },
    ],
    related: ["how-to-export-zite-project", "zite-github-export-guide"],
  },

  // ── GENERAL / OPEN SOURCE (deeper coverage) ────────────────────────────────

  {
    slug: "why-push44-is-open-source",
    title: "Why Push44 Is Open Source (and Why That Matters) | Push44",
    h1: "Why Push44 Is Open Source",
    description: "Push44 is MIT-licensed and fully open source. Learn why that matters for trust, security, and long-term reliability when exporting AI-generated code.",
    platform: "general",
    category: "open-source",
    readTime: 5,
    difficulty: "beginner",
    publishedAt: "2026-06-23",
    updatedAt: "2026-07-02",
    views: 5200,
    keywords: ["push44 open source", "is push44 safe", "mit license ai export tool", "open source github export tool"],
    intro: "Trusting a tool with your GitHub token and source code is a big ask. Push44 addresses this the only way that actually works: by making the entire codebase public and auditable.",
    problem: "Handing credentials to any third-party tool carries risk. Closed-source tools ask you to trust their claims about what happens to your data with no way to verify it.",
    solution: "Push44's full source is published under the MIT License on GitHub. Anyone can read exactly how tokens are stored (client-side, in localStorage), which API calls are made, and confirm there is no hidden server logging your data.",
    steps: [
      { title: "Read the source directly", content: "The entire Push44 codebase — frontend, API proxy code, and build scripts — is available on GitHub for anyone to inspect." },
      { title: "Verify there's no backend database", content: "You can confirm Push44 has no server-side data store; all credentials and history are kept in your browser's localStorage." },
      { title: "Fork and self-host if you want", content: "Because it's MIT licensed, you're free to fork the repository and run your own copy if you want complete control over the deployment." },
      { title: "Contribute back", content: "Found a bug or want a new platform supported? Open a pull request — Push44 accepts community contributions." },
    ],
    tips: [
      "Being open source doesn't just mean 'free' — it means verifiable. Use that to your advantage if you're security-conscious.",
      "Star and watch the repository to get notified of new platform support or security-relevant updates.",
    ],
    mistakes: [
      "Assuming 'free' automatically means 'safe' — always verify claims when possible, which open source uniquely allows.",
    ],
    faqs: [
      { question: "Can I self-host Push44 instead of using the hosted version?", answer: "Yes. Since it's MIT licensed and has no required backend, you can clone the repository and deploy your own instance." },
      { question: "Does open source mean Push44 has no costs to run?", answer: "Hosting a static site has minimal cost, which is part of why Push44 can remain free forever without needing a paid tier." },
    ],
    related: ["ai-code-ownership-guide", "free-ai-code-export-tools", "export-code-without-subscription"],
  },

  {
    slug: "how-github-trees-api-works",
    title: "How the GitHub Trees API Powers Push44's One-Click Push | Push44",
    h1: "How the GitHub Trees API Works",
    description: "A technical look at the GitHub Trees API and how Push44 uses it to push dozens of files in a single atomic commit, without partial or broken pushes.",
    platform: "general",
    category: "github",
    readTime: 7,
    difficulty: "advanced",
    publishedAt: "2026-06-24",
    updatedAt: "2026-07-02",
    views: 4300,
    keywords: ["github trees api", "how push44 works", "atomic git commit multiple files", "github api bulk push"],
    intro: "Pushing dozens of files to GitHub one by one would be slow and risk partial failures. Push44 instead uses the GitHub Trees API to build a complete commit in a handful of API calls.",
    problem: "The naive approach — using the Contents API to create or update each file individually — requires one API call per file and creates one commit per file, which is both slow and pollutes your commit history.",
    solution: "The Trees API lets you build an entire directory tree of blobs (file contents) in memory, attach it to a single commit, and update the branch reference once. This means all files land in exactly one commit, atomically.",
    steps: [
      { title: "Create blobs for each file", content: "Every file's content is uploaded as a 'blob' object via the Git Data API, returning a SHA hash for each." },
      { title: "Build a tree", content: "A 'tree' object is created that maps every file path to its blob SHA, recreating your project's folder structure exactly." },
      { title: "Create a commit", content: "A commit object is created that points to the new tree and references the previous commit as its parent, preserving history." },
      { title: "Update the branch reference", content: "Finally, the branch pointer (e.g. 'refs/heads/main') is updated to point at the new commit — this is the single step that makes the push visible on GitHub." },
      { title: "Handle empty repositories separately", content: "Brand new repos with no commits yet don't have a HEAD reference, so Push44 detects this case and creates the very first commit differently before switching to the standard tree-based flow." },
    ],
    tips: [
      "This is the same technique used by advanced git tooling for bulk file operations — Push44 brings it to a no-code UI.",
      "Because the branch reference update is the last step, your repo is never left in a half-pushed state.",
    ],
    mistakes: [
      "Assuming a failed export means partial data was written — with the Trees API, nothing is visible until the very last step succeeds.",
    ],
    faqs: [
      { question: "Does this approach work for repositories with hundreds of files?", answer: "Yes. The Trees API is designed for exactly this — GitHub itself uses similar tooling internally for bulk operations." },
      { question: "Why does my commit show all files as 'added' the first time?", answer: "On your very first push to a new (or empty) repository, there's no prior tree to diff against, so every file appears as added in that first commit." },
    ],
    related: ["github-version-control-for-ai-apps", "push44-export-failed-fix", "how-to-export-code-from-base44"],
  },

  {
    slug: "how-to-migrate-ai-app-off-platform",
    title: "How to Migrate Your AI-Built App Off the Platform | Push44",
    h1: "Migrating Your AI App Off the Platform",
    description: "Full guide to migrating a Base44, Rocket.new, Floot, or Zite app to independent hosting once you've exported the source code with Push44.",
    platform: "general",
    category: "tutorials",
    readTime: 8,
    difficulty: "advanced",
    publishedAt: "2026-06-25",
    updatedAt: "2026-07-02",
    views: 3900,
    keywords: ["migrate ai app off platform", "leave base44", "self host ai generated app", "move ai app to own hosting"],
    intro: "Exporting your code is step one. This guide covers step two: actually running your AI-built app independently, outside the platform that generated it.",
    problem: "Once you have your source code on GitHub, many builders aren't sure how to actually deploy and run it without the original platform's infrastructure, especially for apps with a backend or database.",
    solution: "Most AI-generated apps follow standard web app patterns (React/Vite frontend, Node/Express or serverless backend, Postgres database) which map cleanly onto independent hosts like Vercel, Railway, or Render.",
    steps: [
      { title: "Export your code with Push44", content: "Push your full project to a GitHub repository, including both frontend and backend directories." },
      { title: "Identify your stack", content: "Open the exported repo and check package.json / requirements files to see exactly which frameworks and dependencies your app uses." },
      { title: "Recreate environment variables", content: "Check for a .env.example or config file listing required environment variables (database URL, API keys) and recreate them on your new host." },
      { title: "Provision a database if needed", content: "If your app used the platform's built-in database, you'll need to provision your own (e.g. a managed Postgres instance) and update the connection string." },
      { title: "Deploy frontend and backend", content: "Connect your GitHub repo to a hosting provider like Vercel or Railway, configure the build command, and deploy." },
      { title: "Test thoroughly", content: "Verify every feature works against the new infrastructure before pointing a custom domain at it or retiring the original platform version." },
    ],
    tips: [
      "Keep the original platform version running until the migrated version is fully verified.",
      "Document your new infrastructure setup in the repo's README so future migrations are easier.",
    ],
    mistakes: [
      "Forgetting to migrate environment variables and secrets, causing silent runtime failures.",
      "Not checking for platform-specific APIs (e.g. built-in auth or storage) that need a replacement on independent hosting.",
    ],
    faqs: [
      { question: "Can every AI-generated app be migrated off its platform?", answer: "Most can, since the exported code is standard web technology. Apps relying heavily on platform-specific built-in services (like managed auth) require replacing those services during migration." },
      { question: "Do I need Push44 for this, or just any export tool?", answer: "You need any tool that gives you complete, unmodified source code — Push44 is built specifically to do this for Base44, Rocket.new, Floot, and Zite." },
    ],
    related: ["why-push44-is-open-source", "ai-code-ownership-guide", "how-to-export-code-from-base44"],
  },

  {
    slug: "how-often-should-you-export-ai-code",
    title: "How Often Should You Export Your AI-Generated Code? | Push44",
    h1: "How Often Should You Export Your AI Code?",
    description: "Recommended export frequency for AI-generated apps depending on project stage — active development, maintenance, and archived projects.",
    platform: "general",
    category: "backup",
    readTime: 4,
    difficulty: "beginner",
    publishedAt: "2026-06-26",
    updatedAt: "2026-07-02",
    views: 4600,
    keywords: ["how often to export ai code", "ai app backup frequency", "when to push ai project to github"],
    intro: "There's no single right answer, but there is a clear framework based on how actively you're developing your AI-built app.",
    problem: "Exporting too rarely risks losing significant work if the platform has an outage or you accidentally break something. Exporting too often for a stable project just adds noise to your GitHub history.",
    solution: "Match your export cadence to your development stage: daily during active building, weekly during maintenance, and once before archiving a finished project.",
    steps: [
      { title: "Active development: after every session", content: "If you're actively prompting and iterating with your AI platform, export after each session so you never lose more than one session's worth of work." },
      { title: "Maintenance mode: weekly", content: "Once your app is stable and you're only making occasional tweaks, a weekly export is enough to stay protected without cluttering your commit history." },
      { title: "Before major platform changes: always", content: "If the platform announces a migration, pricing change, or new version, export immediately regardless of your normal cadence." },
      { title: "Archived projects: one final export", content: "When you're done with a project, do one last thorough export, verify it, then you can safely stop paying attention to the platform version." },
    ],
    tips: [
      "Set a recurring calendar reminder if you tend to forget — consistency matters more than frequency.",
      "Treat any 'this changes soon' announcement from a platform as an immediate trigger to export.",
    ],
    mistakes: [
      "Waiting until something breaks to export for the first time.",
      "Exporting once and assuming that's enough for an actively evolving project.",
    ],
    faqs: [
      { question: "Will frequent exports create too many GitHub commits?", answer: "No — this is exactly what git is designed for. Frequent, small commits give you a more useful history than infrequent, large ones." },
      { question: "Should I export even if nothing seems to have changed?", answer: "It doesn't hurt, but it's not necessary — Push44's diff view will simply show no changes if nothing was modified since your last export." },
    ],
    related: ["ai-project-backup-best-practices", "backup-ai-generated-apps", "push44-export-failed-fix"],
  },

];

// ── Platforms ──────────────────────────────────────────────────────────────────

export const PLATFORMS: PlatformData[] = [
  {
    slug: "base44",
    name: "Base44",
    tagline: "Export your complete Base44 source code to GitHub",
    description: "Base44 is a popular AI app builder. Push44 connects to the Base44 API to fetch all project files and push them to GitHub in one click.",
    color: "#f97316",
    bgColor: "#fff7ed",
    articles: ["how-to-export-code-from-base44", "download-base44-source-code", "base44-github-integration", "base44-version-control-guide", "base44-project-backup-guide"],
    features: ["Read all project files via Base44 API", "Push complete source tree to GitHub", "Version history for every session", "ZIP download option", "Works with email/password and API token auth"],
    exportSteps: ["Get Base44 API token from account settings", "Connect in Push44 with your token", "Select your Base44 project", "Enter GitHub repo details", "Click Push to GitHub"],
    faqs: [
      { question: "Does Push44 work with all Base44 projects?", answer: "Yes. Push44 uses the Base44 API to read any project associated with your account." },
      { question: "Do I need a paid Base44 plan?", answer: "No. The Base44 API used by Push44 is available to all account tiers." },
      { question: "How long does a Base44 export take?", answer: "Typically under 30 seconds for most projects." },
      { question: "Can I export multiple Base44 projects?", answer: "Yes. Run Push44 separately for each project, pointing to different GitHub repos." },
      { question: "Is my Base44 API token safe in Push44?", answer: "Yes. It's stored in your browser's localStorage and never sent to any Push44 server." },
    ],
  },
  {
    slug: "rocket-new",
    name: "Rocket.new",
    tagline: "Export Rocket.new projects and build Android APKs",
    description: "Rocket.new generates full-stack apps and Android APKs. Push44 connects to the Rocket.new container API to export complete projects and trigger APK builds.",
    color: "#22c55e",
    bgColor: "#f0fdf4",
    articles: ["how-to-export-rocket-new-project", "export-rocket-new-to-github", "rocket-new-source-code-download", "rocket-new-apk-export-guide"],
    features: ["Full container file system export", "APK build trigger and download", "Automatic build failure reset", "Works with web and Android projects", "Company ID + API token auth"],
    exportSteps: ["Get Rocket.new API token", "Find your company ID in project settings", "Connect in Push44 with both credentials", "Select your project", "Push to GitHub or download ZIP"],
    faqs: [
      { question: "Does Push44 include backend code in Rocket.new exports?", answer: "Yes. The full container filesystem is exported, including all backend, frontend, and configuration files." },
      { question: "How do I build an Android APK with Push44?", answer: "Connect your Rocket.new project in Push44, navigate to the APK section, and click 'Build APK'. Push44 triggers the build and monitors progress." },
      { question: "What if my Rocket.new container is sleeping?", answer: "Open your project in Rocket.new to wake the container, then return to Push44 and retry." },
    ],
  },
  {
    slug: "floot",
    name: "Floot",
    tagline: "Export Floot projects and publish to GitHub",
    description: "Floot builds and publishes web apps with AI. Push44 uses Floot's session authentication to read project source files and push them to GitHub.",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    articles: ["how-to-export-floot-project", "export-floot-to-github", "floot-source-code-backup", "floot-magic-link-token-guide", "floot-badge-removal-guide"],
    features: ["Session-based authentication", "Complete source file export", "Publish-to-web badge removal", "GitHub push with version history", "Magic link authentication support"],
    exportSteps: ["Get Floot session token from browser cookies", "Connect in Push44 with session token", "Select your Floot workspace and project", "Enter GitHub repo details", "Push source code to GitHub"],
    faqs: [
      { question: "Why do I need to get my Floot token from browser cookies?", answer: "Floot doesn't expose a public API token UI. Push44 uses your active session to authenticate, which means reading the session cookie from your browser." },
      { question: "Does my Floot app stay live after I export?", answer: "Yes. Exporting with Push44 doesn't affect your live Floot app." },
    ],
  },
  {
    slug: "zite",
    name: "Zite",
    tagline: "Export Zite projects and version-control your apps",
    description: "Zite is an AI builder on the Fillout infrastructure. Push44 uses Zite's session and CSRF tokens to read project snapshot templates and push them to GitHub.",
    color: "#8b5cf6",
    bgColor: "#fdf4ff",
    articles: ["how-to-export-zite-project", "zite-github-export-guide", "zite-csrf-token-guide"],
    features: ["Session + CSRF token authentication", "Project snapshot template export", "GitHub version control", "Supports all Zite app types", "Vite proxy for CORS handling"],
    exportSteps: ["Get Zite session ID and CSRF token from browser cookies", "Connect in Push44 with both tokens", "Select your Zite app", "Enter GitHub repo details", "Push snapshot template to GitHub"],
    faqs: [
      { question: "Why does Zite need two tokens?", answer: "Zite uses double-token CSRF protection (a security feature). Push44 needs both the session cookie and CSRF token to authenticate properly." },
      { question: "What does the Zite export include?", answer: "Push44 exports your Zite app's snapshot template — all component definitions, layout configuration, and settings." },
    ],
  },
];

// ── Comparisons ───────────────────────────────────────────────────────────────

export const COMPARISONS: Comparison[] = [
  {
    slug: "push44-vs-zip-download",
    title: "Push44 vs ZIP Download: Best AI Code Export | Push44",
    h1: "Push44 vs ZIP Download",
    description: "Compare Push44 (automated GitHub push) vs ZIP download for exporting AI-generated code. Git history, automation, and long-term value compared.",
    summary: "ZIP downloads give you files. Push44 gives you files plus Git history, automation, and a proper development workflow. For anything beyond a one-time export, Push44 wins.",
    verdict: "Push44 wins for ongoing projects. ZIP download is acceptable only for one-time, final exports.",
    aspects: [
      { aspect: "Setup time", a: { label: "Push44", value: "5 min one-time setup", score: 4 }, b: { label: "ZIP Download", value: "None (just download)", score: 5 }, winner: "b", note: "ZIP download wins on initial setup, but Push44 wins for every subsequent use." },
      { aspect: "Git version history", a: { label: "Push44", value: "Full commit history", score: 5 }, b: { label: "ZIP Download", value: "None", score: 0 }, winner: "a", note: "Git history is the most important long-term advantage of Push44." },
      { aspect: "Automation", a: { label: "Push44", value: "One click per export", score: 5 }, b: { label: "ZIP Download", value: "Manual each time", score: 2 }, winner: "a", note: "Push44 exports take one click after initial setup." },
      { aspect: "Directory structure", a: { label: "Push44", value: "Preserved in GitHub", score: 5 }, b: { label: "ZIP Download", value: "Preserved in ZIP", score: 5 }, winner: "tie", note: "Both preserve directory structure correctly." },
      { aspect: "Cost", a: { label: "Push44", value: "Free forever", score: 5 }, b: { label: "ZIP Download", value: "Often requires paid plan", score: 2 }, winner: "a", note: "Push44 uses platform APIs available to all users. ZIP export is often paywalled." },
      { aspect: "Team collaboration", a: { label: "Push44", value: "GitHub enables collaboration", score: 5 }, b: { label: "ZIP Download", value: "Manual sharing required", score: 1 }, winner: "a", note: "GitHub makes collaboration trivial; ZIP files require manual distribution." },
      { aspect: "Recovery options", a: { label: "Push44", value: "Roll back to any commit", score: 5 }, b: { label: "ZIP Download", value: "Keep old ZIP files manually", score: 2 }, winner: "a", note: "Git's rollback capability is far superior to maintaining old ZIPs." },
    ],
    publishedAt: "2026-06-01",
    updatedAt: "2026-07-02",
  },
  {
    slug: "push44-vs-manual-export",
    title: "Push44 vs Manual Export: Automating AI Code Export | Push44",
    h1: "Push44 vs Manual Export",
    description: "Compare automated Push44 export vs manually copying files from AI platforms. Time, completeness, and error rate compared.",
    summary: "Manual export means copying files one by one from your AI platform's editor. For projects with 10+ files, this is slow, error-prone, and unsustainable. Push44 automates the entire process in seconds.",
    verdict: "Push44 wins in every meaningful category except zero-tool-dependency. Use manual export only if you have no alternative.",
    aspects: [
      { aspect: "Time per export", a: { label: "Push44", value: "30–60 seconds", score: 5 }, b: { label: "Manual", value: "10–30 minutes", score: 1 }, winner: "a", note: "The time difference compounds with every export session." },
      { aspect: "Completeness", a: { label: "Push44", value: "100% — all files via API", score: 5 }, b: { label: "Manual", value: "Risk of missing files", score: 2 }, winner: "a", note: "Manual exports almost always miss some files, especially hidden config files." },
      { aspect: "Error rate", a: { label: "Push44", value: "Near zero (automated)", score: 5 }, b: { label: "Manual", value: "High (copy-paste errors)", score: 1 }, winner: "a", note: "Manual copy-paste introduces typos, missing lines, and forgotten files." },
      { aspect: "Version history", a: { label: "Push44", value: "Automatic with every push", score: 5 }, b: { label: "Manual", value: "Requires extra work", score: 1 }, winner: "a", note: "Push44 creates git commits automatically; manual requires extra git commands." },
      { aspect: "Tool dependency", a: { label: "Push44", value: "Requires Push44 + tokens", score: 3 }, b: { label: "Manual", value: "Only a text editor needed", score: 5 }, winner: "b", note: "Manual export works anywhere. Push44 requires internet and valid tokens." },
    ],
    publishedAt: "2026-06-03",
    updatedAt: "2026-07-02",
  },
  {
    slug: "base44-vs-rocket-new",
    title: "Base44 vs Rocket.new: Which AI Builder to Choose? | Push44",
    h1: "Base44 vs Rocket.new — AI Builder Comparison",
    description: "Compare Base44 and Rocket.new for AI app building. Features, pricing, export options, and when to use each platform.",
    summary: "Base44 excels at web app UI and rapid prototyping. Rocket.new shines for full-stack apps and Android APK generation. Both lack native GitHub export — Push44 adds this to both.",
    verdict: "Choose Base44 for web-first apps and simpler projects. Choose Rocket.new for full-stack complexity and Android app needs.",
    aspects: [
      { aspect: "Web app building", a: { label: "Base44", value: "Excellent UI generation", score: 5 }, b: { label: "Rocket.new", value: "Good, more complex", score: 4 }, winner: "a", note: "Base44's UI generation is particularly strong for consumer-facing apps." },
      { aspect: "Android APK export", a: { label: "Base44", value: "Not supported", score: 0 }, b: { label: "Rocket.new", value: "Native APK builder", score: 5 }, winner: "b", note: "Rocket.new is the clear choice if you need Android app output." },
      { aspect: "Backend complexity", a: { label: "Base44", value: "Good for moderate backends", score: 3 }, b: { label: "Rocket.new", value: "Full-stack with databases", score: 5 }, winner: "b", note: "Rocket.new handles more complex backend scenarios." },
      { aspect: "GitHub export (with Push44)", a: { label: "Base44", value: "Full export via API token", score: 5 }, b: { label: "Rocket.new", value: "Full export via container", score: 5 }, winner: "tie", note: "Push44 supports both equally. Both give you complete source code export." },
      { aspect: "Learning curve", a: { label: "Base44", value: "Gentle — quick to start", score: 5 }, b: { label: "Rocket.new", value: "Moderate — more features", score: 3 }, winner: "a", note: "Base44 is easier for beginners; Rocket.new has more power but more complexity." },
    ],
    publishedAt: "2026-06-05",
    updatedAt: "2026-07-02",
  },
  {
    slug: "best-ai-export-tools-2025",
    title: "Best AI Code Export Tools 2025 | Comparison | Push44",
    h1: "Best AI Code Export Tools in 2025",
    description: "Compare the best tools for exporting AI-generated code in 2025. Push44, manual methods, platform ZIP exports, and more. Free, honest comparison.",
    summary: "Push44 is the most complete free tool for exporting AI code across multiple platforms. Platform-native ZIP exports work if you have a paid subscription. Manual copy-paste is the last resort.",
    verdict: "Push44 is the best free option. Platform native exports are acceptable if already on a paid plan.",
    aspects: [
      { aspect: "Platform support", a: { label: "Push44", value: "Base44, Rocket.new, Floot, Zite", score: 5 }, b: { label: "Native ZIP", value: "Platform-specific only", score: 2 }, winner: "a", note: "Push44's multi-platform support means one tool for all your AI projects." },
      { aspect: "Cost", a: { label: "Push44", value: "Free, open source", score: 5 }, b: { label: "Native ZIP", value: "Requires paid subscription", score: 2 }, winner: "a", note: "Push44 costs nothing. Native export is often locked behind paid tiers." },
      { aspect: "Git history", a: { label: "Push44", value: "Creates real git commits", score: 5 }, b: { label: "Native ZIP", value: "No git history", score: 0 }, winner: "a", note: "This is Push44's single biggest advantage." },
      { aspect: "Official support", a: { label: "Push44", value: "Community-supported OSS", score: 3 }, b: { label: "Native ZIP", value: "Officially supported", score: 5 }, winner: "b", note: "Native exports are maintained by the platform. Push44 relies on API stability." },
    ],
    publishedAt: "2026-06-08",
    updatedAt: "2026-07-02",
  },
  {
    slug: "github-vs-zip-backup",
    title: "GitHub vs ZIP Backup for AI Projects | Push44",
    h1: "GitHub vs ZIP Backup for AI Projects",
    description: "Should you backup AI projects to GitHub or as ZIP files? Compare storage, versioning, access, and long-term value for AI-built apps.",
    summary: "GitHub gives you version history, rollback, collaboration, and is free forever. ZIP files are simpler to understand but have no version history. For any project you care about, GitHub wins.",
    verdict: "GitHub is superior for ongoing projects. ZIP is acceptable only for one-time final archives.",
    aspects: [
      { aspect: "Version history", a: { label: "GitHub", value: "Full git history, unlimited", score: 5 }, b: { label: "ZIP", value: "None — just current state", score: 0 }, winner: "a", note: "This single advantage makes GitHub the clear winner for active projects." },
      { aspect: "Storage cost", a: { label: "GitHub", value: "Free for unlimited repos", score: 5 }, b: { label: "ZIP", value: "Uses local/cloud storage", score: 3 }, winner: "a", note: "GitHub private repos are free. ZIP files require your own storage." },
      { aspect: "Rollback capability", a: { label: "GitHub", value: "Roll back to any commit", score: 5 }, b: { label: "ZIP", value: "Keep all old ZIPs manually", score: 2 }, winner: "a", note: "GitHub rollback is one command; ZIP rollback requires keeping dated archives." },
      { aspect: "Simplicity", a: { label: "GitHub", value: "Requires git knowledge", score: 3 }, b: { label: "ZIP", value: "Anyone can open a ZIP", score: 5 }, winner: "b", note: "ZIP files are universally understood. GitHub has a learning curve." },
      { aspect: "Sharing and collaboration", a: { label: "GitHub", value: "Built-in sharing, PRs, issues", score: 5 }, b: { label: "ZIP", value: "Email or manual file sharing", score: 1 }, winner: "a", note: "GitHub is built for collaboration. ZIP sharing is clunky at scale." },
    ],
    publishedAt: "2026-06-10",
    updatedAt: "2026-07-02",
  },
  {
    slug: "version-control-vs-zip-backup",
    title: "Version Control vs ZIP Backup for AI Apps | Push44",
    h1: "Version Control vs ZIP Backup",
    description: "Version control or ZIP backups for AI-generated apps? Compare both approaches for ongoing AI projects, team use, and long-term code preservation.",
    summary: "Version control (Git/GitHub) is the industry standard for a reason: it's more complete, more useful, and ultimately simpler for ongoing work. ZIP backups are a fallback, not a strategy.",
    verdict: "Use version control for any project you plan to continue developing. ZIP is acceptable only as a supplementary archive format.",
    aspects: [
      { aspect: "Change tracking", a: { label: "Version Control", value: "Line-by-line change history", score: 5 }, b: { label: "ZIP Backup", value: "File-level, no diff", score: 1 }, winner: "a", note: "Git shows exactly what changed, when, and why. ZIP shows nothing." },
      { aspect: "Recovery options", a: { label: "Version Control", value: "Any point in time, any file", score: 5 }, b: { label: "ZIP Backup", value: "Whole project from backup date", score: 2 }, winner: "a", note: "Git can restore individual files from any commit. ZIP only restores the whole archive." },
      { aspect: "Setup complexity", a: { label: "Version Control", value: "Git concepts required", score: 3 }, b: { label: "ZIP Backup", value: "Zero learning curve", score: 5 }, winner: "b", note: "ZIP wins on simplicity. Anyone can create and open a ZIP file." },
      { aspect: "Long-term scalability", a: { label: "Version Control", value: "Designed for long-term use", score: 5 }, b: { label: "ZIP Backup", value: "Manual, doesn't scale", score: 1 }, winner: "a", note: "Version control systems are designed to handle years of history efficiently." },
    ],
    publishedAt: "2026-06-12",
    updatedAt: "2026-07-02",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug);
}

export function getPlatform(slug: string): PlatformData | undefined {
  return PLATFORMS.find(p => p.slug === slug);
}

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find(c => c.slug === slug);
}

export function getRelatedArticles(article: Article): Article[] {
  return article.related
    .map(slug => getArticle(slug))
    .filter((a): a is Article => a !== undefined)
    .slice(0, 4);
}

export function getPlatformArticles(platform: PlatformData): Article[] {
  return platform.articles
    .map(slug => getArticle(slug))
    .filter((a): a is Article => a !== undefined);
}

export function getArticlesByCategory(category: string): Article[] {
  return ARTICLES.filter(a => a.category === category);
}

export function getArticlesByPlatform(platform: string): Article[] {
  return ARTICLES.filter(a => a.platform === platform);
}

export const PLATFORM_META: Record<string, { name: string; color: string; bgColor: string }> = {
  "base44":     { name: "Base44",     color: "#f97316", bgColor: "#fff7ed" },
  "rocket-new": { name: "Rocket.new", color: "#22c55e", bgColor: "#f0fdf4" },
  "floot":      { name: "Floot",      color: "#3b82f6", bgColor: "#eff6ff" },
  "zite":       { name: "Zite",       color: "#8b5cf6", bgColor: "#fdf4ff" },
  "general":    { name: "General",    color: "#64748b", bgColor: "#f8fafc" },
};
