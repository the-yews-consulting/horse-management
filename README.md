# Home Assistant Dashboard

A full-stack Node.js application with Express backend and React frontend for managing your Home Assistant instance.

## Features

- **Express Backend**: RESTful API running on port 3000
- **React Frontend**: Modern UI built with Vite and React
- **SQLite Database**: Secure token storage
- **Home Assistant Integration**: Connect to your Home Assistant instance at http://localhost:8123/api
- **Real-time Entity Management**: View and control all your Home Assistant entities

## Prerequisites

- Node.js (v18 or higher)
- Home Assistant instance running (default: http://localhost:8123)
- Home Assistant Long-Lived Access Token

## Installation

```bash
npm install
```

## Running the Application

### Development Mode (Frontend + Backend)

Run both the frontend and backend servers concurrently:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

### Production Mode

Build the frontend and run the production server:

```bash
npm start
```

The application will be available at http://localhost:3000

### Run Backend Only

```bash
npm run dev:server
```

### Run Frontend Only

```bash
npm run dev:client
```

## Getting Your Home Assistant Token

1. Open your Home Assistant instance
2. Click on your profile (bottom left)
3. Scroll down to "Long-Lived Access Tokens"
4. Click "Create Token"
5. Give it a name and copy the token
6. Paste the token in the login page of this application

## Project Structure

```
.
├── server/
│   ├── server.mjs          # Express server
│   ├── database.mjs        # SQLite database functions
│   ├── homeassistant.mjs   # Home Assistant API client
│   └── routes.mjs          # API routes
├── src/
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
└── dist/                   # Production build (generated)
```

## API Endpoints

- `POST /api/config/token` - Save Home Assistant token
- `GET /api/config/token` - Get token status
- `DELETE /api/config/token` - Delete token
- `GET /api/verify` - Verify Home Assistant connection
- `GET /api/states` - Get all entity states
- `GET /api/states/:entityId` - Get specific entity state
- `POST /api/services/:domain/:service` - Call Home Assistant service

## Database

The application uses SQLite to store your Home Assistant access token securely. The database file is created automatically at `server/homeassistant.db`.

## Security

- Tokens are stored in a local SQLite database
- All API requests to Home Assistant use Bearer token authentication
- CORS is enabled for development

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.
