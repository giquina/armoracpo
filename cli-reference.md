# 🛠️ Complete CLI Reference - Armora CPO

## Quick Command Reference for All Tools

---

## 📦 Supabase CLI

### **Installation**
```bash
npm install -g supabase
```

### **Authentication**
```bash
supabase login
supabase logout
```

### **Project Management**
```bash
# Initialize project
supabase init

# Link to remote project
supabase link --project-ref <project-ref>

# Start local development
supabase start

# Stop local development
supabase stop

# Check status
supabase status
```

### **Database**
```bash
# Create migration
supabase migration new <migration-name>

# Run migrations
supabase db push

# Reset database (dev only!)
supabase db reset

# Dump database
supabase db dump -f dump.sql

# Diff database
supabase db diff
```

### **Functions**
```bash
# Create function
supabase functions new <function-name>

# Deploy function
supabase functions deploy <function-name>

# Invoke function
supabase functions invoke <function-name>
```

### **Storage**
```bash
# List buckets
supabase storage ls

# Create bucket
supabase storage create <bucket-name>

# Upload file
supabase storage upload <bucket-name> <file-path>
```

### **Types**
```bash
# Generate TypeScript types
supabase gen types typescript --project-id <project-id> > types/supabase.ts
```

---

## 🔥 Firebase CLI

### **Installation**
```bash
npm install -g firebase-tools
```

### **Authentication**
```bash
firebase login
firebase logout
firebase login:ci  # Get CI token
```

### **Project Management**
```bash
# Initialize project
firebase init

# List projects
firebase projects:list

# Use project
firebase use <project-id>

# Add project
firebase projects:create <project-id>
```

### **Deployment**
```bash
# Deploy all
firebase deploy

# Deploy specific service
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
firebase deploy --only storage

# Deploy to specific project
firebase deploy --project production
```

### **Functions**
```bash
# Create function
# (Edit functions/index.js manually)

# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log

# Delete function
firebase functions:delete <function-name>
```

### **Hosting**
```bash
# Deploy hosting
firebase deploy --only hosting

# List hosting sites
firebase hosting:sites:list

# Create hosting site
firebase hosting:sites:create <site-id>
```

### **Firestore**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### **Emulators**
```bash
# Start emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only functions,firestore

# Export emulator data
firebase emulators:export ./emulator-data
```

### **Authentication**
```bash
# Export users
firebase auth:export users.json

# Import users
firebase auth:import users.json
```

---

## 🐙 GitHub CLI

### **Installation**
```bash
# macOS
brew install gh

# Linux/Windows
# Download from: https://cli.github.com
```

### **Authentication**
```bash
gh auth login
gh auth logout
gh auth status
```

### **Repository**
```bash
# Clone repo
gh repo clone giquina/armoracpo

# Create repo
gh repo create armoracpo --public

# View repo
gh repo view

# Fork repo
gh repo fork giquina/armora

# Delete repo
gh repo delete armoracpo
```

### **Issues**
```bash
# List issues
gh issue list

# Create issue
gh issue create --title "Bug: Login fails" --body "Description here"

# View issue
gh issue view 123

# Close issue
gh issue close 123

# Reopen issue
gh issue reopen 123
```

### **Pull Requests**
```bash
# List PRs
gh pr list

# Create PR
gh pr create --title "Add geofencing" --body "PR description"

# View PR
gh pr view 42

# Checkout PR
gh pr checkout 42

# Merge PR
gh pr merge 42 --squash

# Close PR
gh pr close 42

# Review PR
gh pr review 42 --approve
gh pr review 42 --request-changes --body "Fix this"
```

### **Actions (CI/CD)**
```bash
# List workflows
gh workflow list

# Run workflow
gh workflow run deploy.yml

# View workflow runs
gh run list

# View run details
gh run view <run-id>

# Watch run
gh run watch <run-id>
```

### **Releases**
```bash
# List releases
gh release list

# Create release
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes"

# View release
gh release view v1.0.0

# Delete release
gh release delete v1.0.0
```

### **Secrets**
```bash
# List secrets
gh secret list

# Set secret
gh secret set SUPABASE_KEY

# Delete secret
gh secret delete SUPABASE_KEY
```

---

## ▲ Vercel CLI (Detailed)

### **Installation**
```bash
npm install -g vercel
```

### **Authentication**
```bash
vercel login
vercel logout
vercel whoami
```

### **Deployment**
```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# Force deploy
vercel --force

# Deploy with name
vercel --name armora-cpo
```

### **Projects**
```bash
# Link project
vercel link

# List projects
vercel projects ls

# Create project
vercel projects add armora-cpo
```

### **Environment Variables**
```bash
# List env vars
vercel env ls

# Add env var
vercel env add REACT_APP_API_URL

# Pull env vars
vercel env pull .env.local

# Remove env var
vercel env rm REACT_APP_API_URL
```

### **Domains**
```bash
# List domains
vercel domains ls

# Add domain
vercel domains add cpo.armora.app

# Remove domain
vercel domains rm cpo.armora.app
```

### **Logs**
```bash
# View logs
vercel logs

# Follow logs
vercel logs --follow

# Production logs
vercel logs --prod
```

---

## 🎨 Stripe CLI (Bonus)

### **Installation**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux/Windows
# Download from: https://stripe.com/docs/stripe-cli
```

### **Authentication**
```bash
stripe login
stripe logout
```

### **Testing Webhooks**
```bash
# Listen for webhooks
stripe listen --forward-to localhost:3000/webhook

# Trigger events
stripe trigger payment_intent.succeeded
stripe trigger customer.created
```

### **Products & Prices**
```bash
# List products
stripe products list

# Create product
stripe products create --name "CPO Service"

# List prices
stripe prices list

# Create price
stripe prices create --product <product-id> --unit-amount 5000 --currency gbp
```

### **Customers**
```bash
# List customers
stripe customers list

# Create customer
stripe customers create --email cpo@example.com --name "John Smith"

# Search customers
stripe customers search --query "email:'cpo@example.com'"
```

---

## 🚀 Quick Workflows

### **Complete Project Setup**
```bash
# 1. Clone repository
gh repo clone giquina/armoracpo
cd armoracpo

# 2. Install dependencies
npm install

# 3. Link Supabase project
supabase link --project-ref your-project-ref

# 4. Pull environment variables
vercel env pull .env.local

# 5. Start development
npm start
```

### **Database Migration**
```bash
# 1. Create migration
supabase migration new add_cpo_profiles

# 2. Edit migration file
# supabase/migrations/XXXXXX_add_cpo_profiles.sql

# 3. Test locally
supabase db reset

# 4. Deploy to production
supabase db push
```

### **Production Deployment**
```bash
# 1. Run tests
npm test

# 2. Build project
npm run build

# 3. Deploy to Vercel
vercel --prod

# 4. Verify deployment
vercel logs --prod --follow
```

### **Emergency Rollback**
```bash
# 1. List deployments
vercel ls

# 2. Promote previous deployment
vercel promote <previous-deployment-url>

# 3. Verify
vercel logs --prod
```

---

## 📊 Command Cheat Sheet

| Task | Supabase | Firebase | Vercel | GitHub |
|------|----------|----------|--------|--------|
| **Login** | `supabase login` | `firebase login` | `vercel login` | `gh auth login` |
| **Init** | `supabase init` | `firebase init` | `vercel link` | `gh repo create` |
| **Deploy** | `supabase db push` | `firebase deploy` | `vercel --prod` | `git push` |
| **Logs** | `supabase logs` | `firebase functions:log` | `vercel logs` | `gh run view` |
| **Env Vars** | N/A | `firebase functions:config` | `vercel env add` | `gh secret set` |
| **Local Dev** | `supabase start` | `firebase emulators:start` | `vercel dev` | N/A |

---

## 🎯 Most Used Commands

### **Daily Development**
```bash
supabase start              # Start local DB
npm start                   # Start React app
vercel dev                  # Start with Vercel functions
```

### **Before Commit**
```bash
npm test                    # Run tests
npm run lint                # Check code quality
npm run build               # Verify build works
```

### **Deployment**
```bash
git push                    # Push to GitHub
vercel --prod               # Deploy to production
```

### **Monitoring**
```bash
vercel logs --follow        # Watch production logs
gh run watch                # Watch CI/CD
```

---

## 🔐 Environment Setup Script

```bash
#!/bin/bash
# setup-armora-cpo.sh

echo "🚀 Setting up Armora CPO development environment..."

# 1. Install CLIs
echo "📦 Installing CLIs..."
npm install -g vercel supabase firebase-tools

# 2. Authenticate
echo "🔐 Authenticating..."
vercel login
supabase login
firebase login
gh auth login

# 3. Link projects
echo "🔗 Linking projects..."
supabase link --project-ref your-project-ref
firebase use armora-cpo
vercel link --project armora-cpo

# 4. Pull environment variables
echo "🌍 Pulling environment variables..."
vercel env pull .env.local

# 5. Start local services
echo "🏃 Starting local services..."
supabase start

echo "✅ Setup complete! Run 'npm start' to begin development."
```

Save as `setup-armora-cpo.sh` and run:
```bash
chmod +x setup-armora-cpo.sh
./setup-armora-cpo.sh
```

---

**CLI Reference Complete! 🛠️**

Use this guide for quick command lookups during development.
