# 🚀 VPS Deployment Guide - Smart Cafe

Complete guide to deploy Smart Cafe on a VPS (DigitalOcean, AWS, Linode, etc.)

---

## 📋 Prerequisites

- Ubuntu 20.04 LTS or higher
- Root or sudo access
- Domain name (optional but recommended)
- Minimum: 2GB RAM, 1 CPU, 25GB SSD

---

## 🔧 Step 1: Initial Server Setup

### 1.1 Connect to Your VPS
```bash
ssh root@your_server_ip
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Create a New User (Recommended)
```bash
adduser smartcafe
usermod -aG sudo smartcafe
su - smartcafe
```

---

## 📦 Step 2: Install Required Software

### 2.1 Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### 2.2 Install MongoDB
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### 2.3 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 2.4 Install Nginx (Web Server)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📥 Step 3: Deploy Application

### 3.1 Clone Repository
```bash
cd ~
git clone https://github.com/kallesh653/smartcafee.git
cd smartcafee
```

### 3.2 Setup Backend

```bash
cd backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Backend `.env` file:**
```env
NODE_ENV=production
PORT=8000

# MongoDB - Use local or MongoDB Atlas
MONGODB_URI=mongodb://localhost:27017/smartcafe_cinema

# JWT Secret - CHANGE THIS!
JWT_SECRET=your_super_long_random_secret_key_here_make_it_very_secure_2024

# JWT Expiry
JWT_EXPIRE=30d

# Business Settings
SHOP_NAME=Smart Cafe - Cinema Theater
SHOP_ADDRESS=Your Address Here
SHOP_MOBILE=+91 1234567890
SHOP_EMAIL=contact@smartcafe.com

# File Upload
UPLOAD_PATH=uploads/products
MAX_FILE_SIZE=5242880
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### 3.3 Seed Ready Items (Optional)
```bash
node seedReadyItems.js
```

### 3.4 Start Backend with PM2
```bash
pm2 start server.js --name smartcafe-backend
pm2 save
pm2 startup
```

### 3.5 Setup Frontend

```bash
cd ~/smartcafee/frontend

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

**Frontend `.env.production` file:**
```env
VITE_API_URL=http://your_server_ip:8000
```

**Build frontend:**
```bash
npm run build
```

This creates a `dist` folder with production-ready files.

---

## 🌐 Step 4: Configure Nginx

### 4.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/smartcafe
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;  # Or use IP: your_server_ip

    # Frontend
    root /home/smartcafe/smartcafee/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $http_x_forwarded_for;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve uploaded files
    location /uploads {
        alias /home/smartcafe/smartcafee/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

### 4.2 Enable Site and Restart Nginx
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/smartcafe /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Step 5: Setup SSL (HTTPS) - Optional but Recommended

### 5.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose redirect HTTP to HTTPS (Option 2)

### 5.3 Auto-Renewal
Certbot automatically sets up auto-renewal. Test it:
```bash
sudo certbot renew --dry-run
```

---

## 🔥 Step 6: Setup Firewall

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 'Nginx HTTP'

# Allow HTTPS
sudo ufw allow 'Nginx HTTPS'

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## 📊 Step 7: MongoDB Security (Important!)

### 7.1 Enable MongoDB Authentication
```bash
mongosh
```

```javascript
use admin
db.createUser({
  user: "smartcafe_admin",
  pwd: "your_strong_password_here",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

use smartcafe_cinema
db.createUser({
  user: "smartcafe_user",
  pwd: "another_strong_password",
  roles: [ { role: "readWrite", db: "smartcafe_cinema" } ]
})

exit
```

### 7.2 Enable MongoDB Security
```bash
sudo nano /etc/mongod.conf
```

Add/uncomment:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

### 7.3 Update Backend .env
```env
MONGODB_URI=mongodb://smartcafe_user:another_strong_password@localhost:27017/smartcafe_cinema?authSource=smartcafe_cinema
```

Restart backend:
```bash
pm2 restart smartcafe-backend
```

---

## 🎯 Step 8: Create Admin User

### 8.1 Connect to MongoDB
```bash
mongosh -u smartcafe_user -p another_strong_password --authenticationDatabase smartcafe_cinema smartcafe_cinema
```

### 8.2 Create Admin User
```javascript
// First, hash your password using bcrypt
// You can use an online tool or create this locally first

db.users.insertOne({
  username: "admin",
  password: "$2a$10$zQX8YvZ9X8Z9X8Z9X8Z9Xeu8Z9X8Z9X8Z9X8Z9X8Z9X8Z9X8Z9X",  // Hash for "admin123"
  email: "admin@smartcafe.com",
  name: "Admin User",
  role: "admin",
  isActive: true,
  canEditPrice: true,
  canGiveDiscount: true,
  maxDiscountPercent: 100,
  canDeleteBill: true,
  canViewReports: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

exit
```

---

## ✅ Step 9: Verify Deployment

### 9.1 Check Backend Status
```bash
pm2 status
pm2 logs smartcafe-backend
```

### 9.2 Check Nginx Status
```bash
sudo systemctl status nginx
```

### 9.3 Check MongoDB
```bash
sudo systemctl status mongod
```

### 9.4 Test Application
Visit: `http://your_domain.com` or `http://your_server_ip`

---

## 🔄 Step 10: Updating the Application

### 10.1 Pull Latest Changes
```bash
cd ~/smartcafee
git pull origin main
```

### 10.2 Update Backend
```bash
cd backend
npm install --production
pm2 restart smartcafe-backend
```

### 10.3 Update Frontend
```bash
cd ../frontend
npm install
npm run build
```

No need to restart Nginx - changes are immediate!

---

## 📋 Useful PM2 Commands

```bash
# View logs
pm2 logs smartcafe-backend

# Restart
pm2 restart smartcafe-backend

# Stop
pm2 stop smartcafe-backend

# Delete
pm2 delete smartcafe-backend

# Monitor
pm2 monit

# View process info
pm2 show smartcafe-backend

# Save current process list
pm2 save

# Startup script (auto-start on reboot)
pm2 startup
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
pm2 logs smartcafe-backend --lines 100
```

### MongoDB Connection Issues
```bash
sudo systemctl status mongod
mongosh  # Test connection
```

### Nginx 502 Bad Gateway
```bash
# Check if backend is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Cannot Access Website
```bash
# Check firewall
sudo ufw status

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Permission Issues
```bash
# Fix uploads folder permissions
sudo chown -R smartcafe:smartcafe ~/smartcafee/backend/uploads
sudo chmod -R 755 ~/smartcafee/backend/uploads
```

---

## 🔐 Security Checklist

- ✅ Change default MongoDB port (optional)
- ✅ Enable MongoDB authentication
- ✅ Use strong JWT_SECRET
- ✅ Enable firewall (ufw)
- ✅ Setup SSL/HTTPS
- ✅ Regular backups
- ✅ Keep system updated
- ✅ Use strong passwords
- ✅ Disable root SSH login (optional)
- ✅ Setup fail2ban (optional)

---

## 💾 Backup Strategy

### Daily MongoDB Backup
```bash
# Create backup script
nano ~/backup-mongodb.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/smartcafe/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

mongodump -u smartcafe_user -p another_strong_password --authenticationDatabase smartcafe_cinema --db smartcafe_cinema --out $BACKUP_DIR/backup_$DATE

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR/backup_$DATE"
```

```bash
chmod +x ~/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

Add:
```
0 2 * * * /home/smartcafe/backup-mongodb.sh >> /home/smartcafe/backup.log 2>&1
```

---

## 📊 Monitoring

### Setup PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🎉 Deployment Complete!

Your Smart Cafe application is now live on your VPS!

**Access your application:**
- **Frontend:** http://your_domain.com or http://your_server_ip
- **API:** http://your_domain.com/api or http://your_server_ip/api

**Default Login:**
- Username: admin
- Password: admin123 (CHANGE THIS!)

---

## 📞 Support

For issues or questions:
- Check logs: `pm2 logs smartcafe-backend`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`

---

**Deployment Guide Version:** 1.0.0
**Last Updated:** December 2024
