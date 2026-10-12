# AICTE IDEA Lab Platform — Institutional Production Deployment Guide

This guide is intended for the IT Systems Administrator at **Kumaraguru College of Technology (KCT)** to deploy the AICTE IDEA Lab Platform into production.

---

## 📋 System Prerequisites
- **Operating System:** Ubuntu 22.04 LTS or 24.04 LTS (recommended)
- **Runtime:** Node.js v20.x or v22.x LTS, npm v10+
- **Web Server:** Nginx with HTTP/2 and SSL support
- **SSL Certificate:** Certbot (Let's Encrypt) for `idealab.kct.ac.in`

---

## 🚀 5-Step Deployment Procedure

### Step 1: Clone and Set Directory Permissions
```bash
sudo mkdir -p /var/www/idealab
sudo chown -R $USER:$USER /var/www/idealab
cd /var/www/idealab
# Place the project files here
```

### Step 2: Configure Environment Variables
Copy and customize the production `.env`:
```bash
cp backend/.env.example backend/.env
nano backend/.env
```
Ensure the following variables are set:
```env
PORT=5003
NODE_ENV=production
CLIENT_URL=https://idealab.kct.ac.in
SESSION_SECRET=a_strong_random_secret_at_least_32_characters_long!

# Persistent Storage Mount
UPLOADS_DIR=/var/data/idealab_uploads

# Microsoft 365 Institutional SMTP
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply.idealab@kct.ac.in
SMTP_PASS=your_m365_app_password
MAIL_FROM="AICTE IDEA Lab, KCT" <noreply.idealab@kct.ac.in>
```
Create the persistent upload directory:
```bash
sudo mkdir -p /var/data/idealab_uploads
sudo chown -R $USER:$USER /var/data/idealab_uploads
```

### Step 3: Install Dependencies & Build Frontend
```bash
# Backend Dependencies
cd /var/www/idealab/backend
npm install --omit=dev

# Frontend Build
cd /var/www/idealab/frontend
npm install
npm run build
# The optimized assets will be generated in frontend/dist/
```

### Step 4: Configure Systemd Backend Daemon
```bash
sudo cp /var/www/idealab/deploy/idealab-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable idealab-backend
sudo systemctl start idealab-backend
sudo systemctl status idealab-backend
```

### Step 5: Configure Nginx & SSL
```bash
sudo cp /var/www/idealab/deploy/nginx-idealab.conf /etc/nginx/sites-available/idealab.conf
sudo ln -s /etc/nginx/sites-available/idealab.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue Free SSL Certificate
sudo certbot --nginx -d idealab.kct.ac.in
```

---

## 💾 Automated Nightly Disaster Recovery Backup
Schedule automated nightly snapshots of the database and uploaded student files:
```bash
chmod +x /var/www/idealab/deploy/backup-cron.sh
crontab -e
```
Add the following line (runs every night at 2:00 AM):
```cron
0 2 * * * /var/www/idealab/deploy/backup-cron.sh >> /var/log/idealab_backup.log 2>&1
```

---

## 🛠️ Post-Deployment Verification
Visit:
👉 `https://idealab.kct.ac.in/Hackathon/admin/system-health`
Verify that:
- **System Status:** `100% Operational`
- **Integrity Score:** `100%`
- All **16 tests pass** with green indicators.
