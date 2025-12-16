#!/bin/bash

##############################################
# Setup New Project on VPS - Quick Script
##############################################

# CONFIGURE THESE VARIABLES:
PROJECT_NAME="project2"              # Change: project2, project3, etc.
BACKEND_PORT="9000"                  # Change: 9000, 10000, 11000, etc.
FRONTEND_PORT="9080"                 # Change: 9080, 10080, 11080, etc.
NGINX_PORT="8001"                    # Change: 8001, 8002, 8003, etc.
DB_NAME="project2_db"                # Change database name
PM2_NAME="project2-backend"          # Change PM2 process name

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setting up: $PROJECT_NAME${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"

# Check if project directory exists
if [ ! -d "/var/www/$PROJECT_NAME" ]; then
    echo -e "${RED}Error: Project directory not found!${NC}"
    echo "Please upload your project to: /var/www/$PROJECT_NAME"
    exit 1
fi

cd /var/www/$PROJECT_NAME

# Backend Setup
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install --production
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    echo "NODE_ENV=production" > .env
    echo "PORT=$BACKEND_PORT" >> .env
    echo "MONGODB_URI=mongodb+srv://colddrink:Kallesh717@cluster0.0hegntf.mongodb.net/$DB_NAME?retryWrites=true&w=majority" >> .env
    echo "JWT_SECRET=${PROJECT_NAME}_secret_key_change_this" >> .env
    echo "JWT_EXPIRE=30d" >> .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}Please edit /var/www/$PROJECT_NAME/backend/.env to customize settings${NC}"
fi

# Frontend Setup
echo -e "${YELLOW}Building frontend...${NC}"
cd ../frontend
npm install
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

# Start with PM2
echo -e "${YELLOW}Starting backend with PM2...${NC}"
cd ../backend
pm2 start server.js --name $PM2_NAME
pm2 save
echo -e "${GREEN}✓ Backend started: $PM2_NAME${NC}"

# Nginx Configuration
echo -e "${YELLOW}Creating Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen $NGINX_PORT;
    server_name \$server_name;

    location / {
        root /var/www/$PROJECT_NAME/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    access_log /var/log/nginx/${PROJECT_NAME}_access.log;
    error_log /var/log/nginx/${PROJECT_NAME}_error.log;
}
EOF

# Enable Nginx site
ln -s /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx configured and reloaded${NC}"
else
    echo -e "${RED}✗ Nginx configuration error${NC}"
fi

# Open firewall
echo -e "${YELLOW}Opening firewall port $NGINX_PORT...${NC}"
ufw allow $NGINX_PORT/tcp
echo -e "${GREEN}✓ Firewall updated${NC}"

# Summary
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo "Project: $PROJECT_NAME"
echo "Backend Port: $BACKEND_PORT"
echo "Frontend Port: $FRONTEND_PORT (dev only)"
echo "Nginx Port: $NGINX_PORT"
echo "Database: $DB_NAME"
echo "PM2 Name: $PM2_NAME"
echo ""
echo "Access URL: http://YOUR_VPS_IP:$NGINX_PORT"
echo ""
echo "PM2 Status:"
pm2 list
