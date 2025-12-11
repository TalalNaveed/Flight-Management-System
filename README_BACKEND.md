# Backend Server

The backend server is now set up and running on port 3000.

## Running the Server

### Run Backend Only
```bash
npm run dev:server
```

### Run Both Frontend and Backend
```bash
npm run dev:all
```

The backend will be available at `http://localhost:3000`
The frontend will be available at `http://localhost:5173`

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /api/auth/login` - Login (customer or staff)
- `POST /api/auth/register/customer` - Register customer
- `POST /api/auth/register/staff` - Register staff

### Flights
- `GET /api/flights` - Search flights (query params: fromCity, toCity, departureDate, returnDate, page, pageSize)
- `GET /api/flights/:flightId/ratings` - Get flight ratings

### Tickets
- `GET /api/customers/:email/tickets` - Get customer tickets (query params: dateFrom, dateTo)
- `POST /api/tickets/purchase` - Purchase ticket (header: x-user-email)

### Ratings
- `POST /api/ratings` - Submit rating

### Staff
- `GET /api/staff/:username/flights` - Get staff flights (query params: dateFrom, dateTo, source, destination)
- `POST /api/staff/:username/flights` - Create flight
- `PATCH /api/staff/:username/flights/:flightId/status` - Change flight status
- `GET /api/staff/:username/airplanes` - Get airplanes
- `POST /api/staff/:username/airplanes` - Add airplane

### Reports
- `GET /api/reports/sales` - Get sales reports (query params: from, to)

## Mock Data

The server uses in-memory mock data stored in `server/mockData.ts`. This will be replaced with a database later.

## Notes

- CORS is enabled for all origins
- All data is stored in memory and will be lost on server restart
- The server uses TypeScript and runs with ts-node-dev for hot reloading

