@echo off
REM Multi-Language ERP System - Quick Start Guide (Windows)

echo.
echo 🚀 Starting Manufacturing ERP System with Multi-Language Support...
echo.
echo 📋 Language Support:
echo    ✅ English (EN)
echo    ✅ Arabic - UAE (العربية)
echo.
echo 🎯 Features:
echo    ✅ Automatic language switching
echo    ✅ Right-to-Left (RTL) support for Arabic
echo    ✅ Language persistence (saved to browser)
echo    ✅ Full translation coverage
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Start development server
echo 🔧 Starting development server...
call npm run dev

echo.
echo ✨ Application is running!
echo.
echo 🌐 Access the application:
echo    Local:   http://localhost:3000 (or 3001 if port in use)
echo.
echo 💡 How to use:
echo    1. Login with any credentials
echo    2. Click 'EN' or 'العربية' to switch language
echo    3. Language changes for entire interface
echo    4. RTL layout automatically applies for Arabic
echo.
echo 📝 For more information, see IMPLEMENTATION_COMPLETE.md
echo.
pause
