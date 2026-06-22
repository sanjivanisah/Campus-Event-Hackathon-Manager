# Google Authentication Setup Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd project/backend
pip install -r requirements.txt
```

### 2. Run Migrations
```bash
python manage.py migrate
```

### 3. Environment Variables
Set the following environment variable:

```bash
export GOOGLE_CLIENT_ID="your-google-client-id-here"
```

Or create a `.env` file in the backend directory:
```
GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd project/frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the frontend directory:
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
```

The Google Client ID must be the same as the one used in the backend.

## Getting Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Search for "Google+ API" in the search bar
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add your frontend URL to "Authorized JavaScript origins":
     - `http://localhost:3000` (for local development)
     - Your production domain
   - Add authorized redirect URIs (not strictly necessary for implicit flow, but good practice):
     - `http://localhost:3000`
     - Your production domain
5. Copy the Client ID and use it in both backend and frontend

## Running the Application

### Terminal 1 - Backend
```bash
cd project/backend
python manage.py runserver
```

### Terminal 2 - Frontend
```bash
cd project/frontend
npm start
```

## API Endpoints

- **Username/Password Login**: `POST /api/token/`
- **Google Authentication**: `POST /api/accounts/google-auth/`
  - Body: `{ "token": "google-id-token" }`
  - Returns: `{ "access": "jwt-token", "refresh": "refresh-token", "user": {...} }`
- **Get Current User**: `GET /api/accounts/me/`
- **Register**: `POST /api/accounts/register/`

## How It Works

1. User clicks "Continue with Google" button on the login page
2. Google OAuth popup opens and user signs in with their Google account
3. Frontend receives the Google ID token
4. Frontend sends the token to the backend's `/api/accounts/google-auth/` endpoint
5. Backend verifies the token with Google's servers
6. Backend creates or retrieves the user and generates JWT tokens
7. Frontend stores the JWT tokens and redirects to dashboard

## Troubleshooting

- **"Google authentication not configured"**: Make sure `GOOGLE_CLIENT_ID` environment variable is set in the backend
- **"Invalid token"**: Ensure the frontend and backend are using the same Google Client ID
- **CORS errors**: The backend has CORS enabled for all origins in development. For production, update `CORS_ALLOWED_ORIGINS` in settings.py

## Security Notes for Production

1. Update `DEBUG = False` in settings.py
2. Set a strong `SECRET_KEY`
3. Update `ALLOWED_HOSTS` with your production domain
4. Set `CORS_ALLOW_ALL_ORIGINS = False` and specify allowed origins
5. Use HTTPS for all URLs
6. Store credentials in environment variables or secret management system
