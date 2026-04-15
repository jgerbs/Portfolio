# Jack Gerber — Software Developer & Cybersecurity Analyst

Full-stack developer and cybersecurity analyst building web applications, security tools, and interactive experiences. Currently completing the Computer Systems Technology (CST) Diploma at BCIT.

&nbsp;

---

## About Me

I'm a developer based in British Columbia with a background spanning software development, cybersecurity, and systems. My work at BCIT across four programs — ACIS, ASD, Computer Systems, and CST — has given me a broad technical foundation, complemented by the Google Cybersecurity Professional Certificate.

I enjoy building things that have real structure to them: authenticated web apps, interactive security demos, tools that make abstract concepts concrete. I'm equally comfortable on the backend wiring up an API as I am thinking through how an attacker might approach a system.

&nbsp;

---

## Projects

### 🔐 MVC Blog Application
A full-stack blog platform built to demonstrate production-style authentication and content management.

- Email confirmation required before first login, password reset via tokenized email links
- Role-based access (Admin / Contributor), admin dashboard for user management
- Cover image uploads, article CRUD with ownership enforcement, date-range filtering
- **Stack:** C#, ASP.NET Core 9 MVC, Entity Framework Core, PostgreSQL, Resend API
- [Live Demo](https://blog.jackgerber.ca) · [View Code](https://github.com/jgerbs/Portfolio/tree/main/BlogApp)

> The live demo may take 15–30 seconds to load — the server spins down on free-tier hosting.

&nbsp;

### 🗨️ Node.js Reddit Clone
A server-rendered Reddit-style app covering the full MVC architecture with auth, voting, and communities.

- Session-based auth via Passport.js, post and comment CRUD with ownership checks
- Up/downvote system with per-user vote state (upsert pattern), cascading deletes
- Subgroups created implicitly on post creation, alphabetical subgroup index
- **Stack:** Node.js, TypeScript, Express.js, EJS, Prisma ORM, PostgreSQL
- [Live Demo](https://reddit.jackgerber.ca) · [View Code](https://github.com/jgerbs/Portfolio/tree/main/redditClone)

> The live demo may take 15–30 seconds to load — the server spins down on free-tier hosting.

&nbsp;

### 🛡️ Cybersecurity Algorithm Demonstrations
A browser-based educational lab with seven interactive demos covering attack mechanics and defensive concepts.

- Keylogger simulation (consent-gated, browser-only), brute force, dictionary, and heuristic PIN attacks
- Parallel heuristic search across 4 Web Workers with live thread-coloured logs
- Full ransomware simulation: fake download site → execution → file encryption → Splunk-style SOC log viewer
- NIST-aligned incident report with MITRE ATT&CK mapping, IOC table, and evidence carousel
- **Stack:** Vanilla JavaScript, HTML5, CSS3, Web Workers API
- [Live Demo](https://jgerbs.github.io/Portfolio/cybersecurityDemos/index.html) · [View Code](https://github.com/jgerbs/Portfolio/tree/main/cybersecurityDemos)

&nbsp;

### 🔑 Password Strength Checker
A real-time password evaluator that scores strength across five tiers and explains exactly what to improve.

- Checks length, character variety (uppercase, lowercase, digits, special chars), and Shannon entropy
- Entropy-based strength tiers from Very Weak to Very Strong with actionable per-criterion feedback
- **Stack:** Python, Streamlit
- [Live Demo](https://password-feedback.streamlit.app) · [View Code](https://github.com/jgerbs/Portfolio/tree/main/passwordStrength)

&nbsp;

### 🌐 Springbok Medical Website
A custom client website built through stakeholder collaboration and agile iteration.

- **Stack:** HTML5, CSS3, JavaScript
- [Live Demo](https://jgerbs.github.io/Springbok/Spa.html) · [View Code](https://github.com/jgerbs/Springbok)

&nbsp;

### 🎮 Simple Platformer Game
A 2D platformer — one of my earliest projects and the build that got me hooked on software development.

- Player state machine (floor, air, wall, ladder), wall-jumping, fireball projectile, enemy stomping and cliff-aware AI, coin collection win condition
- **Stack:** Godot Engine, GDScript
- [Play on itch.io](https://gamesbygerber.itch.io/first-game) · [View Code](https://github.com/jgerbs/Portfolio/tree/main/First%20Game%202.0)

&nbsp;

---

## Skills

**Languages**
`C#` `JavaScript` `TypeScript` `Python` `C++` `Java` `PHP`

**Frameworks & Runtimes**
`ASP.NET Core` `.NET` `Node.js` `Express.js` `Streamlit` `Godot / GDScript`

**Databases & ORM**
`PostgreSQL` `Prisma ORM` `Entity Framework Core`

**Cybersecurity Tools**
`Wireshark` `Nmap` `Splunk` `Suricata` `VirusTotal`

**Systems & Platforms**
`Linux` `PowerShell` `Git` `GitHub Pages` `Render` `Streamlit Cloud`

&nbsp;

---

## Live Deployments

| Project | URL | Platform |
|---|---|---|
| Portfolio Site | [jackgerber.ca](https://jackgerber.ca) | GitHub Pages |
| Blog App | [blog.jackgerber.ca](https://blog.jackgerber.ca) | Render |
| Reddit Clone | [reddit.jackgerber.ca](https://reddit.jackgerber.ca) | Render |
| Cybersecurity Demos | [jgerbs.github.io/Portfolio/cybersecurityDemos](https://jgerbs.github.io/Portfolio/cybersecurityDemos/index.html) | GitHub Pages |
| Password Strength Checker | [password-feedback.streamlit.app](https://password-feedback.streamlit.app) | Streamlit Cloud |
| Platformer Game | [gamesbygerber.itch.io/first-game](https://gamesbygerber.itch.io/first-game) | itch.io |

> Render-hosted apps (Blog, Reddit Clone) may take 15–30 seconds on first load — free-tier servers spin down when idle.

&nbsp;

---

## Currently Working On

- Completing the BCIT Computer Systems Technology (CST) Diploma (expected 2026)
- Deepening practical cybersecurity skills and expanding knowledge of threat analysis, SIEM, and incident response
- Building more full-stack projects with a focus on security and clean architecture

&nbsp;

---

## Contact

- **Portfolio:** [jackgerber.ca](https://jackgerber.ca)
- **GitHub:** [github.com/jgerbs](https://github.com/jgerbs)
- **LinkedIn:** [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
