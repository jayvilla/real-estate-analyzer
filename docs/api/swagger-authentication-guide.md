# Swagger Authentication Guide

## How to Use the Authorize Button in Swagger

### Step-by-Step Instructions

1. **Get a JWT Token**
   - Navigate to the **Authentication** section in Swagger
   - Find the **POST /api/auth/login** endpoint
   - Click "Try it out"
   - Enter your credentials:
     ```json
     {
       "email": "your-email@example.com",
       "password": "your-password"
     }
   - Click "Execute"
   - Copy the `accessToken` from the response

2. **Authorize in Swagger**
   - Look for the **"Authorize"** button at the top right of the Swagger UI
   - Click the **"Authorize"** button (🔒 icon)
   - In the "Value" field, paste your JWT token
   - You can paste:
     - Just the token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - Or with Bearer: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click **"Authorize"**
   - Click **"Close"**

3. **Use Protected Endpoints**
   - Now all protected endpoints will automatically include your token
   - The token is sent in the `Authorization: Bearer <token>` header
   - You can test any endpoint that requires authentication

### Alternative: Register a New User

If you don't have an account:

1. Go to **POST /api/auth/register**
2. Click "Try it out"
3. Enter registration details:
   ```json
   {
     "email": "newuser@example.com",
     "password": "securepassword123",
     "firstName": "John",
     "lastName": "Doe",
     "organizationName": "My Company"
   }
   ```
   
   **Important Notes:**
   - Password must be at least 8 characters long
   - Use `firstName` and `lastName` (not just `name`)
   - `organizationName` is currently required for registration
4. Click "Execute"
5. Copy the `accessToken` from the response
6. Follow steps 2-3 above to authorize

### Token Format

Swagger accepts tokens in two formats:
- **Token only**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **With Bearer**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Both work, but the token-only format is simpler.

### Token Expiration

- Tokens expire after a configured time (default: 24 hours)
- When a token expires, you'll get a 401 Unauthorized error
- Simply login again and update the token in the Authorize dialog

### Troubleshooting

**Problem**: "Unauthorized" errors even after authorizing
- **Solution**: Check that you copied the entire token (it's a long string)
- **Solution**: Try logging in again and updating the token
- **Solution**: Make sure you clicked "Authorize" and "Close" after pasting

**Problem**: Can't find the Authorize button
- **Solution**: Look at the top right of the Swagger UI page
- **Solution**: It's a lock icon (🔒) next to the API title
- **Solution**: Make sure you're viewing the Swagger UI, not just the JSON schema

**Problem**: Token doesn't work
- **Solution**: Verify the token is valid by checking the login response
- **Solution**: Make sure you're using the `accessToken` field, not `refreshToken`
- **Solution**: Check that your account is active and not disabled

### Quick Test

After authorizing, try:
1. **GET /api/properties** - Should return your properties
2. **GET /api/analytics/dashboard** - Should return analytics data

If these work, authentication is set up correctly!

### Security Note

- Never share your JWT token
- Tokens contain user information and permissions
- Logout by clearing the token in the Authorize dialog (click "Logout" or remove the token)

