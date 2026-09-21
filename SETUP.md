# 🛠️ Complete Setup Guide

This guide provides step-by-step instructions to set up and run the AI Agent Team platform locally and deploy it to production.

## 📋 Prerequisites

- **Node.js 18+** or **Bun** (optional)
- **Git**
- A code editor (VS Code recommended)

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/holystunner/ai-agent-team.git
cd ai-agent-team
```

### 2. Install Dependencies

Using npm (recommended):
```bash
npm install
```

Or using Bun:
```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local development settings:

```env
# Authentication
JWT_SECRET=dev-jwt-secret-key-for-local-testing-only
REFRESH_SECRET=dev-refresh-secret-key-for-local-testing-only
ADMIN_PASSWORD=admin123

# Database
DATABASE_URL=./data/agent-system.db

# WebSocket
WS_PORT=8080

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: The database directory (`./data/`) will be created automatically on first run.

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: http://0.0.0.0:3000

### 5. Access the Platform

1. Open your browser and navigate to http://localhost:3000
2. Click "Access Portal" on the landing page
3. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

## 🏗️ Building for Production

### 1. Build the Application

```bash
npm run build
```

This will:
- Compile TypeScript
- Run ESLint checks
- Generate optimized production bundle
- Create static pages where possible

### 2. Test the Production Build Locally

```bash
npm run start
```

The production build will run on http://localhost:3000

## ☁️ Production Deployment (Vercel)

### 1. Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Your repository pushed to GitHub

### 2. Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import" next to your repository `holystunner/ai-agent-team`
3. Configure the project:
   - **Project Name**: `ai-agent-team`
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)

### 3. Set Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

```
JWT_SECRET=f2b8dc958681730785777e2950010097ba8fcde3f94e4192d14435384bfc39a09e2965780d99a81318ea046298d0aec48fc35dd54003d5340c5cb8314dc4fe3c

REFRESH_SECRET=02b33227656c9755c5e16555815ade14b5c80034138cc0a944d1c5274e3c0f753d7ae787a3cdaa0a5006bd40e3cbebe0d5d28177a9f85b56dc25c128965f5bd1

ADMIN_PASSWORD=SecureKassandra2024!

NODE_ENV=production

NEXT_PUBLIC_APP_URL=https://your-domain.com

DATABASE_URL=./data/agent-system.db

WS_PORT=8080
```

> **Important**: These are example production values. For maximum security, generate your own secrets:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 4. Deploy

Click **"Deploy"** and wait for the build to complete (usually 2-3 minutes).

### 5. Connect Custom Domain (Optional)

1. In your Vercel project, go to **Settings > Domains**
2. Add your custom domain (e.g., `kassandrawilliamson.com`)
3. Configure DNS settings as instructed by Vercel
4. Wait 10-15 minutes for DNS propagation
5. SSL certificates are automatically provisioned

### 6. Update Environment Variables

After adding your custom domain, update `NEXT_PUBLIC_APP_URL` in Vercel:
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Then redeploy from the **Deployments** tab.

## 🧪 Testing

### Run Linting

```bash
npm run lint
```

This will:
- Run TypeScript type checking
- Run ESLint code quality checks

### Run the Build

```bash
npm run build
```

This ensures there are no build-time errors.

## 🔧 Troubleshooting

### Build Fails with Font Loading Error

**Issue**: Build fails with "Failed to fetch font from Google Fonts"

**Solution**: This has been fixed by removing Google Fonts and using system fonts. Ensure you have the latest code.

### Database Directory Not Found

**Issue**: Error: "Cannot open database because the directory does not exist"

**Solution**: The `data/` directory is created automatically. If you encounter this error, manually create it:
```bash
mkdir -p data
```

### Authentication Not Working

**Issue**: Login fails with "Invalid username or password"

**Solution**: 
1. Check that `.env.local` has the correct `ADMIN_PASSWORD`
2. Delete the database file to reset: `rm -rf data/`
3. Restart the dev server: `npm run dev`
4. The default admin user will be recreated

### Port Already in Use

**Issue**: Error: "Port 3000 is already in use"

**Solution**: 
```bash
# Find the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Project README](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🆘 Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/holystunner/ai-agent-team/issues)
2. Review the console/terminal output for error messages
3. Ensure all environment variables are correctly set
4. Try deleting `node_modules` and `.next`, then reinstalling:
   ```bash
   rm -rf node_modules .next package-lock.json
   npm install
   npm run dev
   ```

## ✅ Verification Checklist

Before deploying to production, verify:

- [ ] Application builds successfully: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Login works with test credentials
- [ ] Dashboard displays all 7 agents
- [ ] Demo page loads correctly
- [ ] Environment variables are set in Vercel
- [ ] Custom domain is configured (if applicable)

---

**🎉 Your AI Agent Team platform is now fully set up!**
