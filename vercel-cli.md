# ▲ Vercel CLI - Complete Command Reference

## 🚀 Installation

```bash
# Install globally
npm install -g vercel

# Or use with npx (no install needed)
npx vercel

# Check version
vercel --version
```

---

## 🔐 Authentication

```bash
# Login to Vercel
vercel login

# Login with email
vercel login --email you@example.com

# Logout
vercel logout

# Check current user
vercel whoami
```

---

## 📦 Project Management

### **Initialize Project**
```bash
# Link local project to Vercel
vercel link

# Link to specific project
vercel link --project=armora-cpo

# Link to team project
vercel link --team=your-team-slug --project=armora-cpo
```

### **Deploy**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with build command override
vercel --build-cmd="npm run build:prod"

# Deploy specific directory
vercel ./build --prod

# Deploy with custom name
vercel --name=armora-cpo-staging

# Force new deployment
vercel --force
```

### **List Deployments**
```bash
# List all deployments
vercel ls

# List deployments for specific project
vercel ls armora-cpo

# Show deployment details
vercel inspect <deployment-url>
```

### **Remove Deployment**
```bash
# Remove deployment
vercel rm <deployment-url>

# Remove by name
vercel rm armora-cpo-git-feature-xyz

# Remove all preview deployments
vercel rm armora-cpo --safe
```

---

## 🌍 Domain Management

```bash
# List domains
vercel domains ls

# Add domain
vercel domains add cpo.armora.app

# Remove domain
vercel domains rm cpo.armora.app

# Transfer domain
vercel domains transfer cpo.armora.app

# Buy domain
vercel domains buy armora-cpo.com
```

---

## 🔧 Environment Variables

```bash
# List all env vars
vercel env ls

# Add environment variable
vercel env add REACT_APP_API_URL

# Add to specific environment
vercel env add REACT_APP_API_URL production
vercel env add REACT_APP_API_URL preview
vercel env add REACT_APP_API_URL development

# Add from file
vercel env add < .env.production

# Remove env var
vercel env rm REACT_APP_API_URL

# Pull env vars to local
vercel env pull .env.local

# Pull specific environment
vercel env pull .env.production --environment=production
```

---

## 📊 Logs & Monitoring

```bash
# View deployment logs
vercel logs <deployment-url>

# Follow logs (realtime)
vercel logs <deployment-url> --follow

# View logs for production
vercel logs --prod

# View logs since timestamp
vercel logs --since=1h
vercel logs --since=2023-01-01

# View logs with limit
vercel logs --limit=100
```

---

## 🚨 Debugging

```bash
# View deployment errors
vercel inspect <deployment-url>

# View build logs
vercel logs <deployment-url> --output=build

# Check deployment status
vercel ls --meta
```

---

## ⚙️ Project Settings

```bash
# Set project name
vercel project name armora-cpo

# Set build command
vercel project build-cmd "npm run build"

# Set output directory
vercel project output-dir "build"

# Set install command
vercel project install-cmd "npm install"

# Set development command
vercel project dev-cmd "npm start"
```

---

## 🔄 Aliases

```bash
# Create alias
vercel alias <deployment-url> cpo.armora.app

# List aliases
vercel alias ls

# Remove alias
vercel alias rm cpo.armora.app
```

---

## 👥 Team Management

```bash
# List teams
vercel teams ls

# Switch team
vercel switch <team-slug>

# Create team
vercel teams create armora-team

# Invite member
vercel teams invite you@example.com

# Remove member
vercel teams remove you@example.com
```

---

## 🎯 Useful Workflows

### **Complete Deployment**
```bash
# Test, build, and deploy to production
npm test && vercel --prod
```

### **Preview Deployment**
```bash
# Deploy preview and copy URL to clipboard
vercel | tee >(grep -o 'https://[^ ]*' | pbcopy)
```

### **Environment Setup**
```bash
# Pull all environments
vercel env pull .env.local
vercel env pull .env.production --environment=production
vercel env pull .env.preview --environment=preview
```

### **Rollback Deployment**
```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote <previous-deployment-url>
```

---

## 📋 Complete Command Reference

| Command | Description |
|---------|-------------|
| `vercel` | Deploy to preview |
| `vercel --prod` | Deploy to production |
| `vercel login` | Login to account |
| `vercel logout` | Logout |
| `vercel ls` | List deployments |
| `vercel rm <url>` | Remove deployment |
| `vercel logs <url>` | View logs |
| `vercel env ls` | List env vars |
| `vercel env add <key>` | Add env var |
| `vercel env pull` | Download env vars |
| `vercel domains ls` | List domains |
| `vercel domains add <domain>` | Add domain |
| `vercel alias <url> <domain>` | Create alias |
| `vercel inspect <url>` | Inspect deployment |
| `vercel link` | Link project |
| `vercel switch <team>` | Switch team |
| `vercel whoami` | Show current user |

---

## 🔐 Vercel Tokens

### **Create Token**
1. Go to: https://vercel.com/account/tokens
2. Create new token
3. Copy token

### **Use Token**
```bash
# Set token in environment
export VERCEL_TOKEN="your-token-here"

# Use with CLI
vercel --token=$VERCEL_TOKEN ls
```

---

## 🎯 Best Practices

1. **Always test before production**: `vercel` → verify → `vercel --prod`
2. **Use environment-specific env vars**: Different values for prod/preview/dev
3. **Monitor deployments**: `vercel logs --follow` during critical deploys
4. **Use aliases for stable URLs**: Don't rely on deployment URLs
5. **Clean up old deployments**: `vercel rm` unused previews
6. **Pull env vars locally**: `vercel env pull` for consistency

---

**Vercel CLI Reference Complete! ▲**
