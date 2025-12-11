# AirBook - Airline Ticket Reservation System

A production-ready frontend for an airline ticket reservation system built with React, TypeScript, and Material UI.

## Features

### Public Features
- Flight search with filters (source, destination, dates, passengers)
- User registration (customers and airline staff)
- Login for both user types
- Flight search results with pagination

### Customer Features
- Dashboard with upcoming flights summary
- View all purchased tickets with filters
- Search and book flights
- Payment processing
- Rate and comment on completed flights

### Staff Features
- Dashboard with airline-specific stats
- View all flights with customer details
- Create new flights
- Manage airplanes
- Change flight status
- View flight ratings
- Generate sales reports with charts

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router v6
- **Charts**: Recharts
- **State Management**: Context API
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. Extract the downloaded files
2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open http://localhost:5173 in your browser

## Configuration

### API Integration

The app currently uses a mock API service layer. To connect to a real backend:

1. Edit `src/services/mockApi.ts` and replace endpoints with your actual API base URL:
\`\`\`typescript
const API_BASE_URL = 'https://your-api.com'
\`\`\`

2. Update API calls in components and context to use actual fetch calls instead of mock data

## Authentication

- Session tokens are stored in localStorage
- Protected routes use role-based access control
- Auth state is managed globally via Context API

## Validation

- Client-side form validation on all user inputs
- Email format validation
- Password minimum length (6 characters)
- Passport expiration date validation
- Card number and expiration validation

## Mock Data

The app includes mock data for:
- Customers and staff users
- Flights for JetBlue airline
- Airplanes
- Tickets and ratings

## Next Steps to Production

1. Connect to real backend API
2. Add comprehensive error handling
3. Implement proper session management with refresh tokens
4. Add unit and integration tests
5. Implement analytics
6. Add email notifications
7. Enhance security (CSRF tokens, rate limiting)
8. Performance optimization and caching

## API Endpoints Expected

The backend should implement these endpoints:

- `POST /api/auth/login` - Customer/staff login
- `POST /api/auth/register/customer` - Customer registration
- `POST /api/auth/register/staff` - Staff registration
- `GET /api/flights` - Search flights
- `GET /api/customers/:email/tickets` - Get customer tickets
- `POST /api/tickets/purchase` - Purchase ticket
- `POST /api/ratings` - Submit rating
- `GET /api/staff/:username/flights` - Get staff flights
- `POST /api/staff/:username/flights` - Create flight
- `PATCH /api/staff/:username/flights/:flightId/status` - Change status
- `POST /api/staff/:username/airplanes` - Add airplane
- `GET /api/reports/sales` - Get sales reports

