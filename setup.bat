@echo off
echo ========================================
echo Human Unity Union - Setup Script
echo ========================================
echo.

echo [1/4] Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing frontend dependencies...
cd ../client
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Creating directories...
cd ..
if not exist server\config mkdir server\config
if not exist server\models mkdir server\models
if not exist server\routes mkdir server\routes
if not exist server\middleware mkdir server\middleware
if not exist server\controllers mkdir server\controllers
if not exist client\src\components mkdir client\src\components
if not exist client\src\pages mkdir client\src\pages
if not exist client\src\context mkdir client\src\context
if not exist client\src\utils mkdir client\src\utils
if not exist client\public mkdir client\public
echo Directories created successfully!
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Make sure MongoDB is running
echo 2. Update server\.env with your MongoDB URI
echo 3. Start backend: cd server ^&^& npm run dev
echo 4. Start frontend: cd client ^&^& npm start
echo 5. Open http://localhost:3000
echo ========================================
echo.
pause
