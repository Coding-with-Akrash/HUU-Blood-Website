# Human Unity Union - Vercel Deployment Guide

## Prerequisites
- Node.js 18+
- Vercel account
- GitHub repository

## Quick Deploy (No Database Required)

This version uses a JSON file as the database. No MongoDB or external database setup is needed.

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - HUU Welfare Society System"
git remote add origin https://github.com/yourusername/huu.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect the Node.js project
4. Click **Deploy**

### 3. Configure Environment Variables

After deployment, go to your project settings:

1. **Settings** → **Environment Variables**
2. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_SECRET` | `your_secure_random_string_here` | A secure random string for JWT encryption |
| `NODE_ENV` | `production` | Environment mode |

### 4. Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** or push a new commit to trigger redeployment

### 5. Access Your Application

Your application will be live at:
```
https://your-project-name.vercel.app
```

### 6. Default Admin Account

Use the following credentials to log in:
- **Email:** `admin@huu.org`
- **Password:** `admin123`

### 7. Create Staff/Volunteer Accounts

1. Visit `/signup` on your deployed URL
2. Create an account with role "staff" or "volunteer"
3. Access the admin dashboard at `/admin/dashboard`

## Database

The application uses a local JSON file (`data/db.json`) as the database.

- Seed data is included with 3 default users and sample drives
- On Vercel, data is stored in `/tmp` and persists for the lifetime of the serverless instance
- For persistent storage, consider:
  - Vercel Blob Storage
  - External JSON storage API
  - Upgrading to MongoDB Atlas

## Important Notes

### File System in Vercel

Vercel serverless functions have a read-only filesystem except for `/tmp`. The app handles this by:
- Loading seed data from `data/db.json` on first load
- Storing runtime changes in `/tmp/huu-db.json`

### Custom Domain

To use a custom domain:
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Troubleshooting

### Application Not Loading

1. Check Vercel logs: **Deployments** → Click on deployment → **Functions** → **logs**
2. Common issues:
   - Missing `JWT_SECRET` environment variable
   - Port configuration

### Routes Not Working

Ensure `vercel.json` is in the root directory and properly configured.

## Local Testing Before Deployment

Test locally:
```bash
npm install
npm start
```

Visit `http://localhost:5000` and log in with `admin@huu.org` / `admin123`.

## Support

For issues with Vercel deployment, check:
1. Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Project logs in Vercel dashboard
