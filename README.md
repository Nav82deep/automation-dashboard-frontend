# Automation Dashboard Frontend

React-based dashboard for managing the automation system.

## Features

- **Dashboard**: Overview of automation status, statistics
- **Pages Management**: Add, edit, delete Facebook pages
- **Prompts Management**: Create and manage prompts
- **Logs Viewer**: Real-time log viewing with filters

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```

## Configuration

The frontend connects to the backend API at `http://localhost:3001/api` by default.

To change the API URL, edit `src/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api';
```

## Pages

### Dashboard
- View automation status
- See active pages count
- View statistics (total logs, successful/failed posts)
- Trigger automation manually

### Pages
- List all Facebook pages
- Add new pages with access tokens
- Assign prompts to pages
- Set posting intervals
- Enable/disable pages

### Prompts
- List all prompts
- Create new prompts
- Edit existing prompts
- Set niche (celebrity, news, general)
- Enable/disable prompts

### Logs
- View all system logs
- Filter by type (database_connection, operation, post_execution)
- Filter by level (info, warn, error)
- Real-time updates (refreshes every 10 seconds)

## Tech Stack

- **React 18** - UI framework
- **React Router** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool

