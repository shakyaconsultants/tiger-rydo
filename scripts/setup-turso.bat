@echo off
echo ============================================
echo  TIGER RYDO - Turso Production Setup
echo ============================================
echo.
echo 1. Create free account: https://turso.tech
echo 2. Install Turso CLI: https://docs.turso.tech/cli/installation
echo 3. Run these commands:
echo.
echo    turso auth login
echo    turso db create tiger-rydo
echo    turso db show tiger-rydo --url
echo    turso db tokens create tiger-rydo
echo.
echo 4. Add to Vercel - Settings - Environment Variables:
echo.
echo    DATABASE_URL        = libsql://....turso.io
echo    TURSO_AUTH_TOKEN    = eyJ....
echo    AUTH_SECRET         = long-random-string
echo    AUTH_URL            = https://your-app.vercel.app
echo.
echo 5. Push schema + seed from your PC (one time):
echo.
echo    set DATABASE_URL=libsql://....turso.io
echo    set TURSO_AUTH_TOKEN=eyJ....
echo    npm run db:setup
echo.
echo 6. Git push - Vercel will redeploy automatically.
echo.
pause
