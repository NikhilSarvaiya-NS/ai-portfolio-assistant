# 🚀 Nikhil Sarvaiya - Personal Portfolio & AI Assistant 2.0

A personalized portfolio website designed for recruiters, startup founders, and clients. Powered by a secure, server-side PHP completions API backend (OpenRouter + Cohere Mini Code), it features **Zakrom**, an AI assistant with session memory context and production-grade security.

---

## 🌟 Key Features

* **AI Assistant 2.0 (Zakrom)**: A context-aware chatbot with session memory. Zakrom can discuss skills, project details, and contact info, complete with a bouncing-dot typing indicator and quick action suggestion pills.
* **Production-Grade Security**: Environment-variable protection, session-based rate limiting (max 15 requests/min), HTML sanitization, secure HTTP response headers, and global JSON error formatting.
* **SEO Optimization**: Fully loaded with meta tags, OpenGraph cards, Twitter preview cards, and Schema.org JSON-LD Person structured data.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5 (Semantic), CSS3, Bootstrap v5.3.8, JavaScript (ES6+), Waypoints, Typed.js, AOS.js
* **Markdown Parsing**: Marked.js (renders dynamic chatbot responses in real time)
* **Backend**: PHP (mediates session rate-limits, input validations, and secure completions endpoint connections)
* **AI Integration**: OpenRouter completions API running `cohere/north-mini-code:free` (configurable in `chat.php`)

---

## 💻 Local Setup & Development

To run this project locally, you need a local server environment supporting PHP (such as **XAMPP**, **MAMP**, or **WampServer**).

### 1. Clone the Repository
```bash
git clone https://github.com/NikhilSarvaiya-NS/NKportfolio.git
cd NKportfolio
```

### 2. Configure Environment Variables
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure your API key:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
   ```

### 3. Run the Project
* Turn on **Apache** in your local server utility (e.g. XAMPP Control Panel).
* Open your browser and navigate to `http://localhost/NKportfolio`.
* Click the floating AI icon at the bottom-right corner to talk to the AI Assistant.

---


## 🚀 Deployment

The project requires hosting that supports **PHP 7.4+** for the AI completions proxy.

Refer to the complete [DEPLOYMENT_GUIDE.md](file:///c:/xampp_new/htdocs/NKportfolio/DEPLOYMENT_GUIDE.md) for step-by-step instructions on deploying to **Shared PHP Hosting (e.g., Hostinger)**, **Render/Railway**, or **Vercel** with PHP serverless runtimes.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
