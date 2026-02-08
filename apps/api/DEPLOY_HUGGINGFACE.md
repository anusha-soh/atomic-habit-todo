# Deploy to Hugging Face Spaces (Free Tier)

## Prerequisites

1. [Hugging Face account](https://huggingface.co/join) (free)
2. [Neon PostgreSQL database](https://neon.tech/) (free tier) - already set up from Phase 2

## Step-by-Step Deployment

### 1. Create a New HF Space

1. Go to https://huggingface.co/new-space
2. Fill in:
   - **Owner**: your username
   - **Space name**: `atomic-habits-api`
   - **License**: MIT (or your preference)
   - **SDK**: **Docker**
   - **Hardware**: **CPU basic** (free)
3. Click "Create Space"

### 2. Set Environment Secrets

In your Space settings (Settings tab > Variables and secrets):

| Secret Name | Value | Example |
|-------------|-------|---------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require` |
| `BETTER_AUTH_SECRET` | A strong random JWT secret | `your-64-char-random-string` |
| `ALLOWED_ORIGINS` | Frontend URLs (comma-separated) | `https://your-app.vercel.app,http://localhost:3000` |

### 3. Push Code to HF Space

**Option A: Push via Git (recommended)**

```bash
# Clone your HF Space repo
git clone https://huggingface.co/spaces/YOUR_USERNAME/atomic-habits-api
cd atomic-habits-api

# Copy API files
cp -r /path/to/phase-2-webapp/apps/api/* .

# Rename HF_README.md to README.md (HF uses this for Space config)
mv HF_README.md README.md

# Push to HF
git add .
git commit -m "Deploy Atomic Habits API"
git push
```

**Option B: Use the HF CLI**

```bash
# Install HF CLI
pip install huggingface_hub

# Login
huggingface-cli login

# Upload the API directory
huggingface-cli upload YOUR_USERNAME/atomic-habits-api ./apps/api . --repo-type=space
```

### 4. Verify Deployment

Once the Space builds (2-5 minutes):

1. Visit `https://YOUR_USERNAME-atomic-habits-api.hf.space/`
   - Should return: `{"status": "ok", "message": "Atomic Habits API..."}`

2. Visit `https://YOUR_USERNAME-atomic-habits-api.hf.space/docs`
   - Should show Swagger UI with all endpoints

3. Test health endpoint:
   ```bash
   curl https://YOUR_USERNAME-atomic-habits-api.hf.space/health
   ```

### 5. Update Frontend API URL

In your frontend `.env` or environment config, set:
```
NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-atomic-habits-api.hf.space
```

## Free Tier Limits

| Resource | Limit |
|----------|-------|
| CPU | 2 vCPUs |
| RAM | 16 GB |
| Storage | 50 GB |
| Uptime | Sleeps after 48h inactivity |
| Build time | 30 min max |
| Network | Unlimited |

**Note**: Free tier Spaces sleep after 48 hours of inactivity. The first request after sleep takes ~30-60 seconds to cold start. This is fine for demos and development.

## Troubleshooting

### Space won't build
- Check the "Build" tab for error logs
- Ensure `Dockerfile` is in the root of the Space repo
- Ensure `pyproject.toml` lists all dependencies

### Database connection fails
- Verify `DATABASE_URL` secret is set correctly
- Ensure Neon project allows connections from all IPs (default)
- Check if `?sslmode=require` is in the connection string

### CORS errors
- Add your frontend URL to `ALLOWED_ORIGINS` secret
- Include both `http://` and `https://` variants
- Restart the Space after changing secrets

### Space sleeps too often
- Consider upgrading to a paid tier ($0.06/hr for persistent)
- Or use a keep-alive ping service (UptimeRobot, free tier)
