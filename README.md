# Watson UI

Mobile-first web interface for Watson — Dr. Bill Yomes' AI-powered digital assistant.

## Stack
- Next.js App Router (TypeScript)
- Tailwind CSS
- Vercel deployment

## Setup

### 1. Clone and install
```bash
git clone https://github.com/byomes/watson-ui
cd watson-ui
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:

**WATSON_PASSWORD_HASH** — bcrypt hash of your chosen password.
Generate it:
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'yourpassword', bcrypt.gensalt()).decode())"
```

**ANTHROPIC_API_KEY** — from console.anthropic.com. Used until Beelink Watson API is live.

### 3. Icons
Copy Watson icons into `public/icons/`:
- `watson-icon-dark-192.png`
- `watson-icon-dark-512.png`

From: `C:\Users\billy\OneDrive\Claude\agents\watson\icons\`

### 4. Run locally
```bash
npm run dev
```

Open `http://localhost:3000`

### 5. Deploy to Vercel
```bash
git init
git add .
git commit -m "Initial Watson UI"
git remote add origin https://github.com/byomes/watson-ui
git push -u origin main
```

Then in Vercel:
- Import `byomes/watson-ui`
- Add environment variables: `WATSON_PASSWORD_HASH`, `ANTHROPIC_API_KEY`
- Set custom domain: `watson.williamckyomes.com`

## Swapping to Beelink Watson API
When the Beelink is set up, update `app/api/chat/route.ts`:
- Uncomment the `WATSON_API_URL` line
- Remove the direct Anthropic call
- Add `WATSON_API_URL` to Vercel env vars

## PWA — Add to Home Screen
On iPhone: open `watson.williamckyomes.com` in Safari → Share → Add to Home Screen.
Runs fullscreen, no browser chrome.
