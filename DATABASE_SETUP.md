# Database Setup Guide

## Step 1: Install PostgreSQL

### Quick Option - Using Docker (Easiest)
If you have Docker installed:
```bash
docker run --name bookbite-postgres -e POSTGRES_PASSWORD=bookbite123 -p 5432:5432 -d postgres:15
```

### Alternative - Local Installation
**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Set password during installation (remember this!)
4. Default port: 5432

## Step 2: Update Database Connection

Edit `backend/.env` and update the `DATABASE_URL`:

**If using Docker (from above):**
```
DATABASE_URL="postgresql://postgres:bookbite123@localhost:5432/bookbite?schema=public"
```

**If using local PostgreSQL:**
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/bookbite?schema=public"
```
(Replace `YOUR_PASSWORD` with the password you set during installation)

## Step 3: Run Migrations

Open terminal in the `backend` folder:
```bash
npx prisma migrate dev --name init
```

This creates all the database tables (User, Business, Room, etc.)

## Step 4: Seed Admin User

```bash
npx prisma db seed
```

This creates an admin account:
- **Email:** admin@bookbite.com
- **Password:** Admin123!

## Step 5: Test the Setup

1. **Start Backend:**
   ```bash
   npm run dev
   ```
   Should see: "Server is running on port 5000"

2. **Start Admin Portal:**
   ```bash
   cd ../admin
   npm run dev
   ```
   Open browser to: http://localhost:5173

3. **Login:**
   - Email: admin@bookbite.com
   - Password: Admin123!

4. **Generate Activation Code:**
   - Go to "Activation Codes" page
   - Set price (e.g., 10.00)
   - Click "Generate Code"
   - Copy the generated code

5. **Test Mobile App:**
   ```bash
   cd ../mobile
   npx expo start
   ```
   - Navigate to Register
   - Select "Manager" role
   - Enter the activation code

## Troubleshooting

**"Connection refused" error:**
- Make sure PostgreSQL is running
- Check the port (default: 5432)
- Verify DATABASE_URL in .env

**"Database does not exist" error:**
- The migration will create it automatically
- Or manually create: `createdb bookbite`

**Seed fails:**
- Make sure migrations ran first
- Check that bcrypt is installed: `npm install bcrypt`
