# 📱 Book Bite Frontend Testing Guide

## 🚀 Quick Start

### 1. Start Development Environment
```bash
# Option 1: Start both backend and frontend together
node start-dev.js

# Option 2: Start manually (in separate terminals)
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm start
```

### 2. Open Your App
- **Expo Go**: Scan the QR code with your phone
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web**: Press `w` in the terminal

## 🧪 Testing Your Backend Connection

### In the App:
1. **Open the Login Screen**
2. **Click "🔗 Test Backend Connection"** button
3. **Check the results**:
   - ✅ **Connected**: Your backend is working!
   - ❌ **Disconnected**: Backend might not be running

### Test Registration:
1. **Click "👤 Test Registration"** (if connected)
2. **Check if a user is created** in your MongoDB Atlas database
3. **Verify the success message**

## 📋 What to Test

### ✅ Authentication Flow
1. **Register a New User**:
   - Name: `Test User`
   - Email: `test@bookbite.com`
   - Password: `Password123`
   - Role: `User`

2. **Login with the User**:
   - Email: `test@bookbite.com`
   - Password: `Password123`

3. **Check Profile**:
   - Should show real user data from backend

### ✅ Demo Credentials (Fallback)
If backend is not available, try these:
- **Admin**: `admin@bookbite.com` / `password123`
- **Hotel Owner**: `hotel@bookbite.com` / `password123`
- **Restaurant Owner**: `restaurant@bookbite.com` / `password123`
- **User**: `user@bookbite.com` / `password123`

## 🔍 Troubleshooting

### Backend Not Connecting?
1. **Check Backend Status**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Common Issues**:
   - Backend not running: `cd backend && npm run dev`
   - Wrong port: Check if backend is on port 3000
   - Network issues: Try restarting both servers

### App Not Loading?
1. **Clear Expo Cache**:
   ```bash
   expo start -c
   ```

2. **Restart Metro**:
   - Press `r` in the terminal
   - Or close and restart `npm start`

### Database Issues?
1. **Check MongoDB Atlas**:
   - Login to your Atlas dashboard
   - Check if cluster is running
   - Verify connection string in `.env`

2. **Test Database Connection**:
   ```bash
   cd backend
   node scripts/test-mongodb.js
   ```

## 📊 Expected Behavior

### ✅ With Backend Connected:
- **Registration**: Creates real users in MongoDB
- **Login**: Authenticates against backend API
- **Profile**: Shows real data from database
- **Hotels/Restaurants**: Empty initially (can add via API)

### ✅ With Backend Disconnected (Fallback):
- **Registration**: Creates local users
- **Login**: Uses demo credentials
- **Profile**: Shows mock data
- **Hotels/Restaurants**: Shows mock data

## 🎯 Next Steps

### 1. Add Sample Data
Once connected, add some hotels and restaurants:
```bash
# In backend directory
node scripts/add-sample-data.js
```

### 2. Test All Features
- ✅ User registration/login
- ✅ Hotel browsing
- ✅ Restaurant browsing  
- ✅ Booking creation
- ✅ Order placement
- ✅ Profile management

### 3. Test Different Roles
- **User**: Browse and book
- **Hotel Owner**: Manage hotels and rooms
- **Restaurant Owner**: Manage restaurants and menu
- **Admin**: Full system access

## 🚀 Production Deployment

When ready for production:
1. **Update API URLs** in `src/services/apiService.ts`
2. **Deploy Backend** to cloud service
3. **Update Environment Variables**
4. **Build and Deploy Frontend**

## 📞 Need Help?

If you encounter issues:
1. Check the console logs in your terminal
2. Check the React Native debugger
3. Verify your backend is running on port 3000
4. Test the connection using the built-in test button

Your Book Bite app is now ready for development! 🎉