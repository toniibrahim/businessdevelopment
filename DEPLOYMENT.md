# Business Development Pipeline - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Redis Setup](#redis-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Cloud Platform Deployment](#cloud-platform-deployment)
9. [SSL/HTTPS Configuration](#ssl-https-configuration)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Backup and Recovery](#backup-and-recovery)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js:** v18+ (LTS recommended)
- **PostgreSQL:** v14+
- **Redis:** v6+
- **Docker:** v20+ (optional, for containerized deployment)
- **Docker Compose:** v2+ (optional)
- **Git:** For code deployment
- **Nginx:** For reverse proxy (recommended)
- **PM2:** For process management (recommended)

### Hardware Requirements

#### Minimum (Development/Small Teams)
- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 20GB SSD
- **Network:** 1 Gbps

#### Recommended (Production)
- **CPU:** 4+ cores
- **RAM:** 8GB+
- **Storage:** 50GB+ SSD
- **Network:** 1 Gbps+
- **Backup Storage:** 100GB+

---

## Environment Configuration

### Backend Environment Variables

Create `.env` file in the `backend/` directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=bd_pipeline_user
DB_PASSWORD=strong_password_here
DB_DATABASE=bd_pipeline_prod

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_here

# JWT Configuration
JWT_SECRET=generate_a_very_strong_secret_key_here
JWT_REFRESH_SECRET=generate_another_strong_secret_here
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Generate Secure Secrets:**
```bash
# Generate JWT secret (Linux/Mac)
openssl rand -base64 64

# Generate JWT secret (Windows PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Frontend Environment Variables

Create `.env.production` file in the `frontend/` directory:

```bash
VITE_API_URL=https://api.your-domain.com/api
VITE_APP_NAME=BD Pipeline
VITE_APP_VERSION=1.0.0
```

---

## Database Setup

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create user
CREATE USER bd_pipeline_user WITH PASSWORD 'strong_password_here';

# Create database
CREATE DATABASE bd_pipeline_prod OWNER bd_pipeline_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bd_pipeline_prod TO bd_pipeline_user;

# Exit
\q
```

### 3. Run Migrations

```bash
cd backend
npm install
npm run migration:run
```

### 4. Seed Initial Data (Optional)

```bash
npm run seed
```

This creates:
- Admin user (admin/admin123)
- Sample teams and users
- Sample clients and opportunities

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

---

## Redis Setup

### 1. Install Redis

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Windows:**
Download from [redis.io](https://redis.io/download) or use WSL

### 2. Configure Redis

Edit `/etc/redis/redis.conf`:

```conf
# Bind to localhost
bind 127.0.0.1 ::1

# Set password
requirepass your_redis_password

# Set max memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Enable persistence
save 900 1
save 300 10
save 60 10000
```

Restart Redis:
```bash
sudo systemctl restart redis
```

### 3. Test Connection

```bash
redis-cli
127.0.0.1:6379> AUTH your_redis_password
OK
127.0.0.1:6379> PING
PONG
```

---

## Backend Deployment

### Option 1: Direct Node.js Deployment with PM2

#### 1. Install PM2 Globally
```bash
npm install -g pm2
```

#### 2. Build the Application
```bash
cd backend
npm install --production
npm run build
```

#### 3. Start with PM2
```bash
pm2 start dist/server.js --name bd-pipeline-api \
  --instances max \
  --exec-mode cluster \
  --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 4. PM2 Management Commands
```bash
# View logs
pm2 logs bd-pipeline-api

# Monitor
pm2 monit

# Restart
pm2 restart bd-pipeline-api

# Stop
pm2 stop bd-pipeline-api

# Delete
pm2 delete bd-pipeline-api
```

### Option 2: Systemd Service

Create `/etc/systemd/system/bd-pipeline.service`:

```ini
[Unit]
Description=BD Pipeline API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/bd-pipeline/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable bd-pipeline
sudo systemctl start bd-pipeline
sudo systemctl status bd-pipeline
```

---

## Frontend Deployment

### 1. Build the Application
```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in `frontend/dist/`.

### 2. Option 1: Nginx Static Hosting

Copy build files to web server:
```bash
sudo mkdir -p /var/www/bd-pipeline
sudo cp -r dist/* /var/www/bd-pipeline/
sudo chown -R www-data:www-data /var/www/bd-pipeline
```

Create Nginx configuration `/etc/nginx/sites-available/bd-pipeline`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/bd-pipeline;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional if on same server)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/bd-pipeline /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Option 2: Serve with Express

Create a simple Node.js server to serve the built files:

```javascript
// serve.js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
```

---

## Docker Deployment

### 1. Build Images

```bash
# Build backend
docker build -t bd-pipeline-backend ./backend

# Build frontend
docker build -t bd-pipeline-frontend ./frontend
```

### 2. Using Docker Compose

The project includes `docker-compose.yml` for easy deployment:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### 3. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: bd_pipeline_prod
      POSTGRES_USER: bd_pipeline_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - bd-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - bd-network

  backend:
    image: bd-pipeline-backend:latest
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - bd-network

  frontend:
    image: bd-pipeline-frontend:latest
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - bd-network

volumes:
  postgres_data:
  redis_data:

networks:
  bd-network:
    driver: bridge
```

Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Cloud Platform Deployment

### AWS (Elastic Beanstalk)

1. **Install AWS CLI and EB CLI:**
```bash
pip install awscli awsebcli
```

2. **Initialize EB:**
```bash
cd backend
eb init -p node.js bd-pipeline-api
```

3. **Create Environment:**
```bash
eb create bd-pipeline-prod --database.engine postgres
```

4. **Deploy:**
```bash
eb deploy
```

5. **Frontend (S3 + CloudFront):**
```bash
# Build frontend
cd frontend && npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### DigitalOcean (Droplet)

1. **Create Droplet:**
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- Enable backups

2. **Initial Setup:**
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Create user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL, Redis, Nginx
sudo apt install postgresql redis-server nginx
```

3. **Deploy Application:**
```bash
# Clone repository
git clone https://github.com/yourorg/bd-pipeline.git
cd bd-pipeline

# Setup backend
cd backend
npm install
npm run build
pm2 start dist/server.js --name bd-api

# Setup frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/bd-pipeline/
```

### Heroku

1. **Install Heroku CLI:**
```bash
npm install -g heroku
heroku login
```

2. **Create Apps:**
```bash
# Backend
heroku create bd-pipeline-api
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev

# Deploy
git push heroku main
```

3. **Frontend:**
Deploy to Netlify or Vercel (see below)

### Netlify (Frontend)

1. **Connect Repository:**
- Go to netlify.com
- Click "New site from Git"
- Connect GitHub repository
- Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Environment variables: `VITE_API_URL`

2. **Custom Domain:**
- Add custom domain in Netlify settings
- Update DNS records

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free SSL)

1. **Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain Certificate:**
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

3. **Auto-Renewal:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
```

### Manual SSL Configuration

Update Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

---

## Monitoring and Logging

### Application Monitoring with PM2

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View metrics
pm2 monit

# Enable PM2 web dashboard
pm2 web
```

### Logging

**Backend Logs:**
The application uses Winston for logging. Logs are stored in:
- `backend/logs/error.log` - Error logs
- `backend/logs/combined.log` - All logs

**PM2 Logs:**
```bash
pm2 logs bd-pipeline-api
```

**System Logs:**
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

### Log Rotation

Create `/etc/logrotate.d/bd-pipeline`:

```
/var/www/bd-pipeline/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Monitoring Tools

**Recommended:**
- **New Relic** - APM and infrastructure monitoring
- **Datadog** - Full-stack monitoring
- **Sentry** - Error tracking
- **Uptime Robot** - Uptime monitoring (free)

---

## Backup and Recovery

### Database Backups

**Automated Backup Script:**

Create `/usr/local/bin/backup-bd-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/bd-pipeline"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="bd_pipeline_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

pg_dump -U bd_pipeline_user bd_pipeline_prod | gzip > $BACKUP_DIR/$FILENAME

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

Make executable and add to cron:
```bash
sudo chmod +x /usr/local/bin/backup-bd-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-bd-db.sh
```

**Restore Database:**
```bash
gunzip < bd_pipeline_20240115_020000.sql.gz | psql -U bd_pipeline_user -d bd_pipeline_prod
```

### Redis Backups

Redis automatically creates snapshots in `/var/lib/redis/dump.rdb`.

Copy to backup location:
```bash
sudo cp /var/lib/redis/dump.rdb /var/backups/bd-pipeline/redis_$(date +%Y%m%d).rdb
```

### Application Backups

```bash
# Backup uploaded files
tar -czf /var/backups/bd-pipeline/uploads_$(date +%Y%m%d).tar.gz /var/www/bd-pipeline/backend/uploads

# Backup environment files
tar -czf /var/backups/bd-pipeline/config_$(date +%Y%m%d).tar.gz /var/www/bd-pipeline/backend/.env /var/www/bd-pipeline/frontend/.env.production
```

---

## Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
pm2 logs bd-pipeline-api --lines 100
```

**Common issues:**
1. **Database connection failed:**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check credentials in `.env`
   - Test connection: `psql -U bd_pipeline_user -d bd_pipeline_prod`

2. **Redis connection failed:**
   - Verify Redis is running: `sudo systemctl status redis`
   - Check Redis password in `.env`
   - Test connection: `redis-cli -a your_password PING`

3. **Port already in use:**
   - Check what's using the port: `sudo lsof -i :5000`
   - Kill the process or change PORT in `.env`

### Frontend Shows Blank Page

1. **Check console for errors** in browser DevTools
2. **Verify API URL** in `.env.production`
3. **Check CORS settings** in backend
4. **Clear browser cache** and rebuild: `npm run build`

### Database Migration Fails

```bash
# Revert last migration
npm run migration:revert

# Check database connection
npm run typeorm -- query "SELECT NOW()"

# Generate new migration
npm run migration:generate -- -n FixName
```

### High Memory Usage

**Check PM2 status:**
```bash
pm2 status
pm2 monit
```

**Restart application:**
```bash
pm2 restart bd-pipeline-api
```

**Optimize PM2 cluster:**
```bash
pm2 delete bd-pipeline-api
pm2 start dist/server.js --name bd-pipeline-api --instances 2 --max-memory-restart 500M
```

### Slow Performance

1. **Enable Redis caching** (already implemented)
2. **Add database indexes:**
```sql
CREATE INDEX idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_activities_opportunity ON activities(opportunity_id);
```

3. **Enable Gzip compression** in Nginx (see configuration above)
4. **Use CDN** for static assets
5. **Optimize images** in frontend

---

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (ufw/iptables)
- [ ] Set up fail2ban for SSH
- [ ] Disable root SSH login
- [ ] Use environment variables for secrets
- [ ] Enable database SSL connections
- [ ] Set up regular backups
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Monitor security advisories
- [ ] Use strong database passwords
- [ ] Restrict database access to localhost
- [ ] Enable Redis password authentication

---

## Performance Optimization

### Database
- Regular VACUUM and ANALYZE
- Connection pooling (already configured)
- Add indexes on frequently queried columns

### Redis
- Set appropriate maxmemory
- Use LRU eviction policy
- Monitor memory usage

### Node.js
- Use PM2 cluster mode
- Enable gzip compression
- Optimize bundle size
- Use production mode

### Frontend
- Enable code splitting
- Lazy load routes
- Optimize images
- Use CDN for static assets
- Enable service worker for PWA

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check application uptime
- Review performance metrics

### Weekly
- Review backup logs
- Check disk space
- Update security patches

### Monthly
- Full backup verification
- Dependency updates
- Performance review
- Security audit

### Quarterly
- Disaster recovery drill
- Capacity planning review
- User feedback review
- Feature planning

---

## Support and Resources

- **Documentation:** `/api/docs` (Swagger UI)
- **Repository:** https://github.com/yourorg/bd-pipeline
- **Email Support:** support@example.com
- **Status Page:** status.your-domain.com

---

## License

MIT License - See LICENSE file for details
