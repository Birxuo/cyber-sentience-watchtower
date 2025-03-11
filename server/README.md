# Cyber Sentience Watchtower Backend

This is the backend server for the Cyber Sentience Watchtower security monitoring dashboard. It provides real-time network monitoring, threat detection, and alert management through a RESTful API and WebSocket connections.

## Features

- Real-time network monitoring and visualization
- Security alert management
- Threat detection and analysis
- System metrics tracking
- WebSocket integration for instant updates

## Tech Stack

- Node.js with Express
- TypeScript
- Supabase for data storage
- Socket.IO for real-time communication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Supabase account and project

### Installation

1. Clone the repository (if you haven't already)
2. Navigate to the server directory:

```bash
cd server
```

3. Install dependencies:

```bash
npm install
```

4. Configure environment variables:
   - Review the `.env` file and update Supabase settings:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Running the Server

#### Development Mode

```bash
npm run dev
```

This will start the server with hot-reloading enabled.

#### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Network

- `GET /api/network/nodes` - Get all network nodes
- `GET /api/network/connections` - Get all network connections
- `GET /api/network/topology` - Get complete network topology
- `POST /api/network/simulate` - Simulate network activity

### Alerts

- `GET /api/alerts` - Get all alerts (with optional filtering)
- `GET /api/alerts/:id` - Get a specific alert
- `POST /api/alerts` - Create a new alert
- `PATCH /api/alerts/:id/read` - Mark an alert as read/unread
- `DELETE /api/alerts/:id` - Delete an alert
- `POST /api/alerts/mark-all-read` - Mark all alerts as read

### Metrics

- `GET /api/metrics` - Get all system metrics
- `GET /api/metrics/threat-level` - Get current threat level
- `GET /api/metrics/traffic` - Get traffic statistics
- `GET /api/metrics/detection` - Get AI detection metrics
- `POST /api/metrics/threat-level` - Update threat level

## WebSocket Events

### Server to Client

- `networkUpdate` - Emitted when network topology changes
- `newAlert` - Emitted when a new alert is created
- `alertDeleted` - Emitted when an alert is deleted
- `metricsUpdate` - Emitted when system metrics are updated

## Integration with Frontend

To connect the frontend to this backend:

1. Update the frontend API service to point to this backend server
2. Replace mock data services with actual API calls
3. Implement WebSocket listeners for real-time updates

## License

MIT