# VisaLink Africa - Complete VPS Deployment Guide

## Prerequisites
- VPS with Ubuntu/Debian
- Domain `visalinkafrica.com` pointing to VPS IP
- SSH access to VPS
- Certbot already installed and configured

## Step 1: Install Required Software

```bash
sudo apt update
sudo apt install -y git nginx postgresql postgresql-contrib nodejs npm
sudo npm install -g pm2
```

## Step 2: Create PostgreSQL Database and User

```bash
sudo -u postgres psql
```

Run in psql:

```sql
CREATE DATABASE visalink_africa;
CREATE USER visalink_user WITH PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE visalink_africa TO visalink_user;

\c visalink_africa

GRANT ALL ON SCHEMA public TO visalink_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO visalink_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO visalink_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO visalink_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO visalink_user;
```

Exit with `\q`

## Step 3: Deploy Application Code

```bash
cd /var/www
sudo mkdir -p visalinkafrica
sudo chown $USER:$USER visalinkafrica
cd visalinkafrica

git clone <YOUR_GIT_REPO_URL> .
```

## Step 4: Configure Backend

```bash
cd /var/www/visalinkafrica/backend
npm install
```

Create/update `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=visalink_africa
DB_USER=visalink_user
DB_PASSWORD=your_strong_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5009
NODE_ENV=production

# CORS Configuration - Allow frontend domain
FRONTEND_URL=https://visalinkafrica.com
```

Run database migrations:

```bash
npm run migrate
```

## Step 5: Start Backend with PM2

```bash
cd /var/www/visalinkafrica/backend
pm2 start server.js --name visalink-backend --update-env
pm2 save
pm2 startup
# Follow the command it outputs to enable auto-start on reboot
```

## Step 6: Build Frontend

```bash
cd /var/www/visalinkafrica
npm install
```

Create `.env` file in root directory:

```env
REACT_APP_API_URL=https://visalinkafrica.com/api
```

Build frontend:

```bash
npm run build
```

This creates the production build in `/var/www/visalinkafrica/build`

## Step 7: Configure Nginx (with HTTPS)

Edit nginx config:

```bash
sudo nano /etc/nginx/sites-available/visalinkafrica
```

Use this configuration (certbot will have already added SSL certificates):

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name visalinkafrica.com www.visalinkafrica.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS - Main server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name visalinkafrica.com www.visalinkafrica.com;

    # SSL certificates (certbot should have added these)
    ssl_certificate /etc/letsencrypt/live/visalinkafrica.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/visalinkafrica.com/privkey.pem;
    
    # SSL configuration (certbot may have added these)
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Serve React frontend build
    root /var/www/visalinkafrica/build;
    index index.html;

    # Frontend routes (SPA - React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5009/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support (for Socket.io)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable site and test:

```bash
sudo ln -s /etc/nginx/sites-available/visalinkafrica /etc/nginx/sites-enabled/visalinkafrica
sudo rm /etc/nginx/sites-enabled/default  # optional
sudo nginx -t
sudo systemctl reload nginx
```

## Step 8: Verify Everything Works

1. Check backend is running:
   ```bash
   pm2 status
   pm2 logs visalink-backend
   ```

2. Test backend API:
   ```bash
   curl https://visalinkafrica.com/api/health
   ```

3. Visit in browser:
   - `https://visalinkafrica.com` - Should show your React frontend
   - Frontend should be able to call `/api/*` endpoints

## Troubleshooting

### Backend not starting
- Check logs: `pm2 logs visalink-backend`
- Check port: `sudo lsof -i:5009`
- Verify database connection in `.env`

### Frontend not loading
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify build exists: `ls -la /var/www/visalinkafrica/build`
- Check nginx config: `sudo nginx -t`

### API calls failing
- Check CORS in backend `.env` has `FRONTEND_URL=https://visalinkafrica.com`
- Check nginx proxy_pass is correct
- Check backend logs: `pm2 logs visalink-backend`

## Updating the Application

After pulling new code:

```bash
cd /var/www/visalinkafrica

# Pull latest code
git pull

# Rebuild frontend
npm install
npm run build

# Restart backend (if backend code changed)
cd backend
npm install
pm2 restart visalink-backend

# If database schema changed, run migrations
npm run migrate
```
