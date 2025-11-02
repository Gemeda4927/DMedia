# MongoDB Connection Troubleshooting

## Authentication Failed Error

If you're getting `bad auth : Authentication failed`, follow these steps:

### 1. Verify Credentials in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Database Access** (left sidebar)
3. Check if the user `Gammee` exists
4. If the user doesn't exist, create it or use an existing user

### 2. Reset Password if Needed

1. In MongoDB Atlas > Database Access
2. Click on the user (e.g., `Gammee`)
3. Click **Edit** or **Reset Password**
4. Generate a new password (copy it immediately)
5. Update the password in `backend/.env`

### 3. URL Encode Special Characters

If your password contains special characters, you need to URL encode them:

Special characters that need encoding:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`
- `%` → `%25`
- `&` → `%26`
- `=` → `%3D`
- `+` → `%2B`
- ` ` (space) → `%20`

Example:
```
Original: P@ssw0rd#123
Encoded:  P%40ssw0rd%23123
```

### 4. Get Connection String from MongoDB Atlas

1. Go to **Clusters** > Click **Connect**
2. Choose **Connect your application**
3. Select **Node.js** and version **5.5 or later**
4. Copy the connection string
5. Replace `<password>` with your actual password (URL encoded if needed)
6. Replace `<dbname>` with `dhugaa-media`
7. Update `MONGO_URI` in `backend/.env`

### 5. Check Network Access

1. Go to **Network Access** in MongoDB Atlas
2. Ensure your IP is whitelisted (or `0.0.0.0/0` for all IPs - less secure)
3. If needed, add your current IP address

### 6. Verify Database Name

Make sure the database name in the connection string matches what you're using:
- Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/database-name`
- The database name should be `dhugaa-media`

### Current .env Format

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.srfaket.mongodb.net/dhugaa-media?retryWrites=true&w=majority
```

Replace:
- `USERNAME` with your MongoDB Atlas username
- `PASSWORD` with your password (URL encoded if it has special characters)

### Quick Test

You can test your connection string format:
```
mongodb+srv://Gammee:Bbl3q0kEmXJ95Euc@cluster0.srfaket.mongodb.net/dhugaa-media?retryWrites=true&w=majority
```

If this doesn't work, the password might have been changed or needs URL encoding.



