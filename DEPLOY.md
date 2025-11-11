# Deploying WebMessages to Render

This guide shows how to deploy your distributed chat application to Render.

## 🚀 Quick Deploy to Render

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub account and select your repository
   - Render will automatically detect `render.yaml` and configure deployment

3. **Deployment Settings** (auto-configured by render.yaml):
   - **Build Command**: Docker build
   - **Start Command**: `uvicorn server.main:app --host 0.0.0.0 --port 8000`
   - **Plan**: Free (or upgrade as needed)
   - **Environment**: Docker

### Method 2: Manual Docker Deploy

If you prefer manual configuration:

1. **Create New Web Service** on Render
2. **Choose "Deploy from Docker"**
3. **Repository**: Connect your GitHub repo
4. **Configuration**:
   - **Dockerfile Path**: `./Dockerfile`
   - **Environment Variables**:
     - `PYTHONUNBUFFERED=1`
     - `PORT=8000`
   - **Health Check Path**: `/`

## 📁 Files Added for Deployment

- **`Dockerfile`**: Containerizes the Python app
- **`render.yaml`**: Render service configuration
- **`.dockerignore`**: Excludes unnecessary files from Docker build
- **`DEPLOY.md`**: This deployment guide
- **Updated `requirements.txt`**: Production-ready dependencies

## 🌐 After Deployment

Your app will be available at: `https://your-app-name.onrender.com`

**Features that work in production**:
- ✅ Web chat interface with session names
- ✅ Real-time messaging via WebSocket
- ✅ File upload and sharing
- ✅ Individual user sessions per browser tab
- ⚠️ TCP/UDP clients (require additional network configuration)

## 🔧 Production Notes

### TCP/UDP Limitations on Render
- Render's free tier only supports HTTP/WebSocket traffic
- TCP (port 9000) and UDP (port 9001) listeners won't be accessible from external clients
- Web interface and file sharing will work perfectly
- For TCP/UDP support, consider upgrading to Render's paid plans with custom networking

### Environment Variables
Add these in Render dashboard if needed:
- `UPLOAD_MAX_SIZE`: Maximum file upload size
- `DEBUG`: Set to `false` for production

### Custom Domain
- Go to your service → Settings → Custom Domains
- Add your domain and configure DNS

## 🐛 Troubleshooting

**Build fails?**
- Check Docker logs in Render dashboard
- Ensure all files are committed to Git

**App won't start?**
- Verify `requirements.txt` has correct dependencies
- Check that `server/main.py` exists and is valid

**WebSocket connection issues?**
- Render automatically handles WebSocket upgrades
- Check browser console for connection errors

## 💡 Next Steps After Deploy

1. **Test the deployed app** with multiple browsers/tabs
2. **Share the URL** with others to test multi-user chat
3. **Upload files** to test file sharing functionality
4. **Monitor** usage in Render dashboard

## 🔄 Re-deploying Changes

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update chat features"
   git push origin main
   ```
3. Render automatically rebuilds and deploys (if auto-deploy enabled)

Your distributed chat app is now live! 🎉