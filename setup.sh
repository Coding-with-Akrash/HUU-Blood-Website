#!/bin/bash

echo "========================================"
echo "Human Unity Union - Setup Script"
echo "========================================"
echo ""

echo "[1/4] Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies"
    exit 1
fi
echo "Backend dependencies installed successfully!"
echo ""

echo "[2/4] Installing frontend dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies"
    exit 1
fi
echo "Frontend dependencies installed successfully!"
echo ""

echo "[3/4] Creating directories..."
cd ..
mkdir -p server/config server/models server/routes server/middleware server/controllers
mkdir -p client/src/components client/src/pages client/src/context client/src/utils client/public
echo "Directories created successfully!"
echo ""

echo "[4/4] Setup complete!"
echo ""
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Make sure MongoDB is running"
echo "2. Update server/.env with your MongoDB URI"
echo "3. Start backend: cd server && npm run dev"
echo "4. Start frontend: cd client && npm start"
echo "5. Open http://localhost:3000"
echo "========================================"
