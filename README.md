# Stock Desk

Personal stock watchlist with AI analysis powered by Claude.

## Deploy to Netlify (from iPhone)

### Step 1 — Upload to GitHub
1. Create a new **public** repo on GitHub called `stock-desk`
2. Upload ALL files maintaining the folder structure:
   - `index.html`
   - `netlify.toml`
   - `netlify/functions/analyse.js`

### Step 2 — Connect to Netlify
1. Go to **app.netlify.com** in Safari
2. Sign up / log in with your GitHub account
3. Tap **Add new site → Import an existing project**
4. Choose **GitHub** → select your `stock-desk` repo
5. Leave all build settings as default
6. Tap **Deploy site**

### Step 3 — Add your Anthropic API key
1. In Netlify dashboard → your site → **Site configuration → Environment variables**
2. Tap **Add a variable**
3. Key: `ANTHROPIC_API_KEY`
4. Value: your Anthropic API key from console.anthropic.com
5. Tap **Save** → then **Deploys → Trigger deploy → Deploy site**

Your app will be live at `https://your-site-name.netlify.app`

## Add to iPhone Home Screen
1. Open the URL in **Safari**
2. Tap Share → **Add to Home Screen**
