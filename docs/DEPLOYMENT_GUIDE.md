# Deployment Guide: Standard Pumps Quotation System

This document outlines the exact steps to deploy the application into production using **Vercel** (Frontend) and **Render** (Backend).

## 1. Backend Deployment (Render)

Render is recommended because it supports persistent disks, ensuring our SQLite database (which stores quotation history and settings) survives server deployments and restarts.

### Prerequisites
1. Push your code to a GitHub repository.
2. Sign up for [Render.com](https://render.com).

### Deployment Steps
1. Log into Render and click **New+** > **Blueprint**.
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` file in the root of the project.
4. Review the detected service (`spqs-backend`). It should be set to use **Docker**.
5. During setup, configure the following **Environment Variables**:
   - `ENVIRONMENT`: `production`
   - `ALLOWED_HOSTS`: `<your-render-app-name>.onrender.com` (Add your custom domain here later if you use one, comma-separated)
   - `FRONTEND_URL`: `https://<your-vercel-app-url>.vercel.app` (You can update this after deploying Vercel)
   - `DATABASE_URL`: `sqlite:////data/standard_pumps.db` (This points to the persistent disk)
6. Click **Apply**.
7. Render will build the Docker container (which installs Python and WeasyPrint dependencies) and deploy the API.

> [!CAUTION]
> Ensure your Render plan is at least the **Starter** tier. The Free tier does not support persistent disks, meaning your database will be wiped every time the server restarts.

### SQLite Database Backup
Since the database is a single file (`standard_pumps.db`) living on the `/data` disk:
1. Go to the Render Dashboard > Your Web Service > Shell.
2. You can download or backup the database directly from the shell, or use the built-in Settings page export functionality if implemented.

---

## 2. Frontend Deployment (Vercel)

Vercel is optimized for Vite SPAs and provides excellent Edge caching.

### Prerequisites
1. Ensure your backend is deployed and you have its live URL (e.g., `https://spqs-backend.onrender.com`).

### Deployment Steps
1. Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Vercel will auto-detect **Vite**. Leave the Build and Output settings as default.
4. Expand the **Environment Variables** section and add:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://<your-render-app-name>.onrender.com/api/v1` (Ensure there is NO trailing slash)
5. Click **Deploy**.
6. Vercel will read `frontend/vercel.json` automatically to configure SPA routing rewrites.

---

## 3. Post-Deployment Linking
Once Vercel is deployed, it generates a unique URL (e.g., `https://standard-pumps.vercel.app`).
1. Go back to the **Render Dashboard**.
2. Open your backend Web Service > Environment.
3. Update `FRONTEND_URL` to exactly match your Vercel URL (e.g., `https://standard-pumps.vercel.app`).
4. Render will trigger a new deploy. This ensures strict CORS security is established between the two platforms.

## 4. Troubleshooting
- **PDF Generation Failing**: Ensure the backend Dockerfile successfully installed `libpango` and `libcairo`. If fonts look weird, check the logs. WeasyPrint heavily relies on the OS packages provided in the Dockerfile.
- **Network Errors on Frontend**: Check the browser console. If you see CORS errors, ensure `FRONTEND_URL` in Render matches your exact Vercel URL (including `https://` and without a trailing slash).
- **History Dissapearing**: Ensure your Render instance has the persistent disk attached to `/data` and `DATABASE_URL` is pointing to `/data/standard_pumps.db`.
