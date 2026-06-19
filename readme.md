<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CareerPilot-AI</title>
  <style>
    :root{
      --bg:#070A12;
      --card: rgba(255,255,255,.06);
      --card2: rgba(255,255,255,.10);
      --text:#EAF0FF;
      --muted:#B7C0DA;
      --accent:#7C5CFF;
      --accent2:#25D9FF;
      --border: rgba(255,255,255,.12);
      --shadow: 0 18px 60px rgba(0,0,0,.45);
      --radius:18px;
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
      background: radial-gradient(1200px 600px at 10% 0%, rgba(124,92,255,.22), transparent 55%),
                  radial-gradient(900px 450px at 80% 10%, rgba(37,217,255,.16), transparent 50%),
                  linear-gradient(180deg, #060915 0%, #070A12 40%, #050713 100%);
      color:var(--text);
      line-height:1.5;
    }
    .wrap{max-width:1060px;margin:0 auto;padding:28px 18px 64px;}
    .hero{
      display:grid;
      grid-template-columns: 1.25fr .75fr;
      gap:18px;
      align-items:stretch;
    }
    @media (max-width: 860px){.hero{grid-template-columns:1fr}}

    .card{
      background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.05));
      border:1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      backdrop-filter: blur(10px);
    }
    .hero-main{padding:22px 22px 18px; position:relative; overflow:hidden;}
    .hero-main:before{
      content:"";
      position:absolute; inset:-2px;
      background: radial-gradient(600px 220px at 15% 15%, rgba(124,92,255,.35), transparent 55%),
                  radial-gradient(500px 200px at 80% 30%, rgba(37,217,255,.25), transparent 55%);
      pointer-events:none;
      filter:saturate(1.1);
    }
    .hero-main > *{position:relative;}

    .badge{
      display:inline-flex; align-items:center; gap:10px;
      padding:10px 12px;
      background: rgba(124,92,255,.15);
      border:1px solid rgba(124,92,255,.35);
      border-radius: 999px;
      color: var(--text);
      font-weight:600;
      font-size: 14px;
    }
    .badge .dot{
      width:10px; height:10px; border-radius:999px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      box-shadow: 0 0 0 4px rgba(124,92,255,.20);
    }

    h1{margin:14px 0 10px; font-size: 40px; letter-spacing:-.02em;}
    .subtitle{margin:0;color:var(--muted);font-size:16px;max-width:58ch}

    .cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px;}
    .btn{
      display:inline-flex;align-items:center;justify-content:center;gap:10px;
      padding:12px 16px;
      border-radius: 14px;
      text-decoration:none;
      font-weight:700;
      border:1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.06);
      color:var(--text);
      transition: transform .12s ease, background .12s ease, border-color .12s ease;
      user-select:none;
    }
    .btn:hover{transform: translateY(-1px); background: rgba(255,255,255,.09); border-color: rgba(255,255,255,.22)}
    .btn-primary{
      background: linear-gradient(135deg, rgba(124,92,255,.95), rgba(37,217,255,.70));
      border-color: rgba(255,255,255,.18);
      color:#071018;
    }

    .hero-side{padding:18px; display:flex; flex-direction:column; gap:12px;}
    .mini-title{font-weight:800; letter-spacing:.02em; margin:0 0 6px;}
    .kpis{display:grid; grid-template-columns:1fr; gap:10px;}
    .kpi{
      background: rgba(0,0,0,.18);
      border:1px solid rgba(255,255,255,.10);
      border-radius: 16px;
      padding:12px;
    }
    .kpi b{display:block; font-size:18px}
    .kpi span{color:var(--muted); font-size:13px}

    .grid{display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; margin-top:18px;}
    @media (max-width: 980px){.grid{grid-template-columns:1fr}}
    .feature{padding:16px;}
    .feature h3{margin:0 0 6px; font-size:16px}
    .feature p{margin:0;color:var(--muted)}
    .icon{
      width:40px; height:40px; border-radius: 14px;
      display:flex; align-items:center; justify-content:center;
      background: rgba(124,92,255,.14);
      border:1px solid rgba(124,92,255,.35);
      margin-bottom:10px;
      font-size:18px;
    }

    .section{margin-top:22px; padding:18px;}
    .section h2{margin:0 0 12px; font-size:18px}
    ul{margin:0; padding-left:18px}
    li{color:var(--muted); margin:8px 0}
    code.inline{background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.14); padding:2px 6px; border-radius:10px}

    .footer{
      margin-top:22px;
      color: var(--muted);
      font-size: 13px;
      text-align:center;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <div class="card hero-main">
        <div class="badge"><span class="dot"></span> Premium AI “Command Center” for job seekers</div>
        <h1>CareerPilot-AI ✈️</h1>
        <p class="subtitle">
          CareerPilot-AI helps candidates prepare smarter by optimizing resumes for ATS, generating interview intelligence,
          and producing a structured 7-day flight plan—powered by the Google Gemini LLM.
        </p>

        <div class="cta-row">
          <a class="btn btn-primary" href="https://carrierpilot-ai.netlify.app/" target="_blank" rel="noreferrer">🌐 Live App</a>
          <a class="btn" href="#features">✨ Key Features</a>
          <a class="btn" href="#getting-started">⚙️ Getting Started</a>
        </div>

        <div class="grid" id="features">
          <div class="card feature">
            <div class="icon">📝</div>
            <h3>Strategic Resume Optimization</h3>
            <p>ATS alignment + high-fidelity PDF output with recruiter-friendly links.</p>
          </div>
          <div class="card feature">
            <div class="icon">🎯</div>
            <h3>Interview Intelligence</h3>
            <p>Role-specific Q&A, intent analysis, and skill-gap scoring.</p>
          </div>
          <div class="card feature">
            <div class="icon">📅</div>
            <h3>7-Day Flight Plan</h3>
            <p>A day-by-day roadmap to get interview-ready in one week.</p>
          </div>
        </div>
      </div>

      <div class="card hero-side">
        <div>
          <p class="mini-title">What you get</p>
          <div class="kpis">
            <div class="kpi"><b>ATS-ready</b><span>Rewrite + format for job descriptions</span></div>
            <div class="kpi"><b>PDF generation</b><span>HTML → PDF via Puppeteer</span></div>
            <div class="kpi"><b>Schema-first AI</b><span>Zod validation for stable JSON outputs</span></div>
          </div>
        </div>
        <div>
          <p class="mini-title">Stack highlights</p>
          <div class="kpi">
            <b>Node.js + Express</b>
            <span>Backend APIs • MongoDB • Gemini</span>
          </div>
          <div class="kpi" style="margin-top:10px">
            <b>React + SCSS</b>
            <span>Dark, modern UI with smooth UX</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card section" id="getting-started">
      <h2>⚙️ Getting Started</h2>
      <ul>
        <li><b>Prerequisites:</b> Node.js (18+), MongoDB, Google Gemini API Key</li>
      </ul>

      <div style="height:12px"></div>
      <div style="background: rgba(0,0,0,.22); border:1px solid rgba(255,255,255,.10); border-radius: 16px; padding: 14px">
        <div style="color:var(--muted); font-weight:700; margin-bottom:8px">Backend</div>
        <pre style="margin:0; white-space:pre-wrap; color:var(--text)"><code>cd Backend
npm install

# Create .env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
GOOGLE_GENAI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key

npm run dev</code></pre>
      </div>

      <div style="height:12px"></div>
      <div style="background: rgba(0,0,0,.22); border:1px solid rgba(255,255,255,.10); border-radius: 16px; padding: 14px">
        <div style="color:var(--muted); font-weight:700; margin-bottom:8px">Frontend</div>
        <pre style="margin:0; white-space:pre-wrap; color:var(--text)"><code>cd Frontend
npm install
npm run dev</code></pre>
      </div>
    </div>

    <div class="card section">
      <h2>🧱 Project Architecture (high level)</h2>
      <ul>
        <li><b>Multi-model fallback:</b> retries across Gemini models when one fails.</li>
        <li><b>Job queueing:</b> handles concurrent AI tasks gracefully.</li>
        <li><b>Routes:</b> auth + interview APIs with middleware-based auth.</li>
      </ul>
    </div>

    <div class="footer">
      Built with ❤️ for career growth • Live demo: <a href="https://carrierpilot-ai.netlify.app/" target="_blank" rel="noreferrer">https://carrierpilot-ai.netlify.app/</a>
    </div>
  </div>
</body>
</html>

