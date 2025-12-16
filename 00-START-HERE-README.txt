================================================================================
                    SMART CAFE DEPLOYMENT DOCUMENTATION
                         START HERE - COMPLETE GUIDE
================================================================================

VERSION: 2.0.0
LAST UPDATED: December 2024
APPLICATION: Smart Cafe - Cinema Theater Billing System

================================================================================
WELCOME!
================================================================================

This documentation contains EVERYTHING you need to:
  ✓ Deploy Smart Cafe to production VPS server
  ✓ Configure Nginx with advanced optimization
  ✓ Setup SSL/HTTPS with automatic renewal
  ✓ Backup and restore MongoDB database
  ✓ Update code when changes are made
  ✓ Troubleshoot common problems
  ✓ Protect against hackers and security threats
  ✓ Monitor and maintain your server
  ✓ Handle high traffic during cinema rush hours

================================================================================
DOCUMENTATION FILES
================================================================================

This documentation is divided into 6 comprehensive text files:

01-COMPLETE-DEPLOYMENT-GUIDE.txt (READ FIRST!)
----------------------------------------------
START HERE if you're deploying for the first time.

Contents:
  - Prerequisites and system requirements
  - Server initial setup
  - Installing Node.js, MongoDB, PM2, Nginx
  - Cloning and configuring application
  - Database setup
  - Backend configuration
  - Frontend build and deployment

READ TIME: 45 minutes
FOLLOW TIME: 2-3 hours (first deployment)

When to use:
  - First time deployment
  - Setting up new server
  - Fresh installation


02-NGINX-ADVANCED-CONFIGURATION.txt
-----------------------------------
Deep dive into Nginx setup for optimal performance.

Contents:
  - Understanding Nginx role
  - Basic configuration
  - Advanced performance optimization
  - Load balancing for multiple backends
  - Caching strategies
  - Security headers
  - Rate limiting
  - Compression and optimization
  - Troubleshooting Nginx

READ TIME: 30 minutes
APPLY TIME: 1 hour

When to use:
  - After basic deployment
  - Optimizing for high traffic
  - Understanding Nginx settings
  - Improving performance
  - Setting up load balancing


03-SSL-SECURITY-SETUP.txt
-------------------------
Complete SSL/HTTPS setup and security measures.

Contents:
  - Understanding SSL/HTTPS
  - Free SSL with Let's Encrypt (Certbot)
  - SSL configuration and optimization
  - Security headers explained
  - Firewall setup (UFW)
  - SSH security hardening
  - Application security
  - Protecting against hackers

READ TIME: 40 minutes
APPLY TIME: 1-2 hours

When to use:
  - After basic deployment
  - Enabling HTTPS
  - Securing your server
  - Hardening SSH access
  - Understanding security


04-MONGODB-BACKUP-RESTORE.txt
-----------------------------
Complete database management and backup procedures.

Contents:
  - Understanding MongoDB data
  - Manual backup (mongodump)
  - Automated daily backups
  - Restore from backup (mongorestore)
  - Exporting data to JSON/CSV
  - Importing data
  - Database maintenance
  - Performance monitoring
  - Disaster recovery

READ TIME: 30 minutes
APPLY TIME: 45 minutes

When to use:
  - After deployment (setup backups!)
  - Before major updates
  - When data needs recovery
  - Exporting reports
  - Moving to new server


05-CODE-UPDATE-REDEPLOYMENT.txt (VERY IMPORTANT!)
------------------------------------------------
How to deploy code changes without breaking production.

Contents:
  - Understanding update process
  - Preparation before updating
  - Updating backend code
  - Updating frontend code
  - Full updates (both backend and frontend)
  - Zero-downtime deployment
  - Rollback procedures
  - Testing updates
  - Common update scenarios

READ TIME: 35 minutes
APPLY TIME: 15-30 minutes per update

When to use:
  - EVERY TIME you make code changes!
  - Adding new features
  - Fixing bugs
  - Updating dependencies
  - Deploying improvements

⚠️ CRITICAL: Read this before making ANY code changes in production!


06-TROUBLESHOOTING-SECURITY-PROBLEMS.txt (REFERENCE GUIDE)
---------------------------------------------------------
Comprehensive problem-solving and security hardening.

Contents:
PART A: TROUBLESHOOTING
  - Application won't start
  - Cannot access website
  - Database connection errors
  - Performance issues (slow)
  - Memory and CPU problems
  - SSL/HTTPS errors
  - Login problems
  - PM2 issues
  - Nginx problems
  - Git and deployment issues

PART B: SECURITY AND HACKER PREVENTION
  - Understanding threats
  - SSH security hardening
  - Firewall configuration (UFW)
  - Preventing DDoS attacks
  - Preventing SQL/NoSQL injection
  - Protecting against XSS
  - Brute force protection
  - File upload security
  - Monitoring and detection
  - Incident response

READ TIME: 60 minutes (reference, not sequential)
USE TIME: As needed when problems occur

When to use:
  - When something doesn't work
  - Error messages appear
  - Website is slow
  - Suspicious activity detected
  - Security concerns
  - Keep handy for emergencies!

================================================================================
RECOMMENDED READING ORDER
================================================================================

FOR FIRST-TIME DEPLOYMENT:
-------------------------
1. Read: 00-START-HERE-README.txt (this file) ✓
2. Read: 01-COMPLETE-DEPLOYMENT-GUIDE.txt
   Follow all steps to deploy application

3. Read: 03-SSL-SECURITY-SETUP.txt
   Setup HTTPS and secure your server

4. Read: 02-NGINX-ADVANCED-CONFIGURATION.txt
   Optimize for cinema traffic

5. Read: 04-MONGODB-BACKUP-RESTORE.txt
   Setup automated backups (CRITICAL!)

6. Read: 05-CODE-UPDATE-REDEPLOYMENT.txt
   Learn update procedure for future

7. Skim: 06-TROUBLESHOOTING-SECURITY-PROBLEMS.txt
   Know where to look when problems occur


FOR EXISTING DEPLOYMENT:
-----------------------
If application is already deployed and you need to make changes:

1. Read: 05-CODE-UPDATE-REDEPLOYMENT.txt (FIRST!)
   Learn proper update procedure

2. Make changes on local machine

3. Test locally: npm run dev

4. Follow update procedure from guide

5. If problems occur:
   Read: 06-TROUBLESHOOTING-SECURITY-PROBLEMS.txt


FOR PERFORMANCE OPTIMIZATION:
----------------------------
If application is slow or you need to handle more users:

1. Read: 02-NGINX-ADVANCED-CONFIGURATION.txt
   Sections on caching, load balancing, optimization

2. Read: 06-TROUBLESHOOTING-SECURITY-PROBLEMS.txt
   Section 4: Performance Issues

3. Check: MongoDB indexes (Section 5 in MongoDB guide)


FOR SECURITY HARDENING:
----------------------
Before going live or if you have security concerns:

1. Read: 03-SSL-SECURITY-SETUP.txt
   Complete SSL and firewall setup

2. Read: 06-TROUBLESHOOTING-SECURITY-PROBLEMS.txt
   PART B: Security and Hacker Prevention

3. Follow: Security Checklist at end of guide

4. Setup: Fail2ban, SSH hardening, monitoring

================================================================================
QUICK REFERENCE - COMMON TASKS
================================================================================

I NEED TO...

Deploy for first time:
  → Read 01-COMPLETE-DEPLOYMENT-GUIDE.txt
  → Follow all steps in order

Update code after making changes:
  → Read 05-CODE-UPDATE-REDEPLOYMENT.txt
  → Section based on what changed (backend/frontend/both)

Backup database:
  → Read 04-MONGODB-BACKUP-RESTORE.txt
  → Section 2: Manual Backup
  → Command: mongodump --db smartcafe_cinema --gzip --out /root/backups/

Restore database:
  → Read 04-MONGODB-BACKUP-RESTORE.txt
  → Section 4: Restore from Backup
  → Command: mongorestore --db smartcafe_cinema --drop --gzip /path/to/backup/

Setup HTTPS:
  → Read 03-SSL-SECURITY-SETUP.txt
  → Section 2: Free SSL with Let's Encrypt
  → Command: certbot --nginx -d yourdomain.com

Application won't start:
  → Read 06-TROUBLESHOOTING-SECURITY-PROBLEMS.txt
  → Section 1: Application Won't Start

Website is slow:
  → Read 06-TROUBLESHOOTING-SECURITY-PROBLEMS.txt
  → Section 4: Performance Issues
  → Also read 02-NGINX-ADVANCED-CONFIGURATION.txt

Cannot access website:
  → Read 06-TROUBLESHOOTING-SECURITY-PROBLEMS.txt
  → Section 2: Cannot Access Website

Optimize for high traffic:
  → Read 02-NGINX-ADVANCED-CONFIGURATION.txt
  → Section 3: Advanced Performance Optimization
  → Section 4: Load Balancing

Protect against hackers:
  → Read 06-TROUBLESHOOTING-SECURITY-PROBLEMS.txt
  → Part B: Security and Hacker Prevention

Setup automated backups:
  → Read 04-MONGODB-BACKUP-RESTORE.txt
  → Section 3: Automated Daily Backups

Something is broken after update:
  → Read 05-CODE-UPDATE-REDEPLOYMENT.txt
  → Section 7: Rollback Procedures

================================================================================
IMPORTANT COMMANDS CHEAT SHEET
================================================================================

SSH TO SERVER:
  ssh root@72.61.238.39

CHECK APPLICATION STATUS:
  pm2 list
  pm2 logs smartcafe-backend

RESTART APPLICATION:
  pm2 restart smartcafe-backend

CHECK SERVICES:
  systemctl status nginx
  systemctl status mongod

BACKUP DATABASE:
  mongodump --db smartcafe_cinema --gzip --out /root/backups/backup_$(date +%Y%m%d_%H%M%S)

RESTORE DATABASE:
  mongorestore --db smartcafe_cinema --drop --gzip /root/backups/backup_YYYYMMDD_HHMMSS/smartcafe_cinema/

UPDATE CODE:
  cd /root/smartcafee
  git pull origin main
  cd backend && npm install --production && pm2 restart smartcafe-backend
  cd ../frontend && npm install && npm run build

TEST NGINX CONFIG:
  nginx -t

RELOAD NGINX:
  systemctl reload nginx

CHECK LOGS:
  pm2 logs smartcafe-backend
  tail -f /var/log/nginx/error.log
  tail -f /var/log/mongodb/mongod.log

CHECK DISK SPACE:
  df -h

CHECK MEMORY:
  free -h

CHECK CPU:
  top
  htop (if installed)

FIREWALL STATUS:
  ufw status

CHECK OPEN PORTS:
  netstat -tlnp

================================================================================
CRITICAL REMINDERS
================================================================================

⚠️  ALWAYS BACKUP BEFORE MAJOR CHANGES!
    Run: mongodump before deploying updates

⚠️  TEST LOCALLY FIRST!
    Run: npm run dev and test before pushing to production

⚠️  READ UPDATE GUIDE BEFORE DEPLOYING!
    File: 05-CODE-UPDATE-REDEPLOYMENT.txt

⚠️  CHANGE DEFAULT PASSWORDS!
    - Admin password: admin123 → YOUR_PASSWORD
    - JWT_SECRET: Change from default
    - SSH: Use key authentication

⚠️  SETUP AUTOMATED BACKUPS!
    Read: 04-MONGODB-BACKUP-RESTORE.txt, Section 3

⚠️  ENABLE FIREWALL!
    Command: ufw enable

⚠️  SETUP SSL/HTTPS!
    Read: 03-SSL-SECURITY-SETUP.txt

⚠️  MONITOR YOUR SERVER!
    Check logs weekly: pm2 logs, nginx logs, auth logs

⚠️  KEEP SOFTWARE UPDATED!
    Monthly: apt update && apt upgrade

⚠️  DOCUMENT YOUR CHANGES!
    Note any custom configurations you make

================================================================================
DEPLOYMENT CHECKLIST
================================================================================

PRE-DEPLOYMENT:
□ Server meets minimum requirements (2GB RAM, 2 CPU, 25GB disk)
□ Domain name purchased and DNS configured (optional)
□ SSH access to server verified
□ Repository accessible on GitHub

DURING DEPLOYMENT:
□ Node.js 18.x installed
□ MongoDB 7.0 installed and running
□ PM2 process manager installed
□ Nginx web server installed
□ Application code cloned from GitHub
□ Backend .env file configured
□ Frontend .env.production configured
□ Backend dependencies installed
□ Frontend built (npm run build)
□ Nginx configured for both domains
□ PM2 running application in cluster mode
□ Database indexes created
□ Admin user created

POST-DEPLOYMENT:
□ SSL/HTTPS enabled with Let's Encrypt
□ Firewall (UFW) enabled and configured
□ Automated daily backups configured
□ SSH hardened (key auth, custom port, fail2ban)
□ Nginx rate limiting configured
□ Security headers added
□ Application tested in browser
□ Login works
□ Core features tested (billing, inventory, reports)
□ Mobile responsiveness verified
□ Default passwords changed
□ Monitoring setup (logs, pm2 monit)
□ Backup restoration tested
□ Update procedure documented
□ Emergency contacts saved

ONGOING MAINTENANCE:
□ Check backups weekly
□ Review logs weekly
□ Update software monthly
□ Test backup restoration quarterly
□ Review security annually
□ Monitor server resources daily (during peak hours)

================================================================================
GETTING HELP
================================================================================

If you encounter issues not covered in these guides:

1. CHECK THE LOGS:
   - PM2: pm2 logs smartcafe-backend
   - Nginx: tail -f /var/log/nginx/error.log
   - MongoDB: tail -f /var/log/mongodb/mongod.log
   - System: tail -f /var/log/syslog

2. SEARCH THE GUIDES:
   - Use Ctrl+F to search for error messages
   - Look in troubleshooting guide (file 06)

3. ONLINE RESOURCES:
   - Stack Overflow: stackoverflow.com
   - MongoDB Docs: docs.mongodb.com
   - Nginx Docs: nginx.org/en/docs/
   - PM2 Docs: pm2.keymetrics.io

4. COMMUNITY:
   - GitHub Issues: github.com/kallesh653/smartcafee/issues

5. PROFESSIONAL HELP:
   - VPS Provider Support
   - MongoDB Professional Services
   - DevOps Consultants

================================================================================
DOCUMENTATION MAINTENANCE
================================================================================

These guides are living documents. As you learn and make changes:

1. ADD NOTES:
   - Document custom configurations
   - Note solutions to unique problems
   - Record your specific server details

2. UPDATE GUIDES:
   - If procedures change
   - When software versions update
   - When you discover better methods

3. VERSION CONTROL:
   - Keep guides in git repository
   - Track changes over time
   - Share improvements with team

================================================================================
SUCCESS CRITERIA
================================================================================

Your deployment is successful when:

✓ Application accessible at https://yourdomain.com
✓ SSL certificate shows padlock in browser
✓ Login works for admin and cashiers
✓ Fast Order creates bills successfully
✓ Products display correctly
✓ Stock updates reflect in inventory
✓ Reports generate correctly
✓ Mobile view works smoothly
✓ No errors in browser console (F12)
✓ No errors in PM2 logs
✓ Database backup runs daily
✓ Server responds quickly (<2 second page loads)
✓ Application handles 50+ concurrent users
✓ Firewall is active
✓ Monitoring is in place

================================================================================
PERFORMANCE TARGETS
================================================================================

Your cinema application should achieve:

RESPONSE TIMES:
  - Page load: <2 seconds
  - API calls: <500ms
  - Bill creation: <1 second
  - Search: <300ms

AVAILABILITY:
  - Uptime: 99.9% (max 43 minutes downtime per month)
  - During cinema hours: 100%

CONCURRENCY:
  - Simultaneous users: 50-100
  - Peak billing: 20 bills/minute

SCALABILITY:
  - Database size: Up to 2GB
  - Years of data: 5+ years
  - Daily backups: <30 seconds

================================================================================
FINAL NOTES
================================================================================

Deploying a production application is a significant responsibility. Take time
to understand each step. Don't rush the process.

REMEMBER:
  📚 Read the relevant guide before taking action
  🔒 Security is not optional - implement all recommended measures
  💾 Backups are your safety net - automate them!
  🔄 Test updates in development before production
  📊 Monitor your application regularly
  🎯 Cinema rush hours require special attention to performance
  ⚡ Zero-downtime deployment keeps customers happy
  🛡️  Defense in depth - multiple security layers protect you

Your Smart Cafe application is a critical business tool. Treat it with care,
maintain it regularly, and it will serve your cinema theater reliably for
years to come.

Good luck with your deployment! 🎬🍿

================================================================================
DOCUMENT VERSION HISTORY
================================================================================

Version 2.0.0 (December 2024)
  - Complete rewrite of all documentation
  - Added advanced Nginx configuration
  - Comprehensive security guide
  - Detailed troubleshooting procedures
  - Code update and redeployment guide
  - MongoDB backup and restore procedures
  - Added performance optimization tips
  - Added hacker prevention strategies
  - Mobile-first considerations
  - Cinema-specific optimizations

Version 1.0.0 (Initial Release)
  - Basic deployment guide
  - Simple Nginx setup
  - Basic SSL setup

================================================================================
END OF START HERE README
================================================================================

Now proceed to: 01-COMPLETE-DEPLOYMENT-GUIDE.txt
