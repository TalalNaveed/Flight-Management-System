import { Request, Response } from "express";
import { db } from "../config/db";
import { buildFlightId, formatFlightIdDatePart, parseFlightId } from "../utils/auth.utils";
import { getSessionUser } from '../middleware/auth.middleware'

// ---------------------------------------------------------
// 1. GET ALL FLIGHTS FOR STAFF
// ---------------------------------------------------------
export const getStaffFlights = async (req: Request, res: Response) => {
  try {
    // Get username from session (pid for staff is their username)
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.role !== 'staff') {
      return res.status(401).json({ error: 'Unauthorized: Staff login required' })
    }
    const username = sessionUser.pid
    const { dateFrom, dateTo, source, destination } = req.query;

    // DATABASE VERIFICATION: Query database to verify user is airline staff
    // This prevents unauthorized users from accessing staff functions
    const [staffRows] = await db.query<any[]>(
      "SELECT Airline_Name FROM Airline_Staff WHERE Username = ?",
      [username]
    );

    // Verify user exists in Airline_Staff table (database check)
    if (staffRows.length === 0) {
      console.log(`❌ UNAUTHORIZED: User ${username} attempted to access staff flights but is not in Airline_Staff table`)
      return res.status(403).json({ 
        error: "Unauthorized: You must be airline staff. User not found in staff database." 
      });
    }

    const airline = staffRows[0].Airline_Name;
    console.log(`✅ AUTHORIZED: Verified ${username} is staff for airline ${airline} via database query`)
    console.log('Staff username:', username);
    console.log('Staff airline:', airline);

    // 2. Build SQL query
    let sql = `
      SELECT 
        f.Airline_Name,
        f.Flight_number,
        f.Dep_date_time,
        f.Arr_date_time,
        f.Base_price,
        f.Flight_Status,
        f.Dep_Airport_Code,
        f.Arr_Airport_Code,
        f.Airplane_ID
      FROM Flight f
      WHERE f.Airline_Name = ?
    `;

    const params: any[] = [airline];

    if (dateFrom) {
      sql += " AND DATE(f.Dep_date_time) >= ?";
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += " AND DATE(f.Dep_date_time) <= ?";
      params.push(dateTo);
    }
    if (source) {
      sql += " AND f.Dep_Airport_Code = ?";
      params.push(source);
    }
    if (destination) {
      sql += " AND f.Arr_Airport_Code = ?";
      params.push(destination);
    }

    console.log('Staff flights query:', sql);
    console.log('Query params:', params);
    
    const [flights] = await db.query<any[]>(sql, params);
    
    console.log('Found flights:', flights.length);

    // 3. Get passengers for each flight and map fields
    const flightsWithPassengers = await Promise.all(
      (flights as any[]).map(async (f: any) => {
        // Get passenger tickets
        const [passRows] = await db.query<any[]>(
          `
          SELECT 
            Ticket_ID,
            Customer_Email,
            Purchase_date_time,
            Card_type
          FROM Ticket
          WHERE Airline_Name = ?
            AND Flight_number = ?
            AND Dep_date_time = ?
          `,
          [f.Airline_Name, f.Flight_number, f.Dep_date_time]
        );

        // Get airplane total seats (Airplane has composite key: Airline_Name, ID)
        const [seatRows] = await db.query<any[]>(
          "SELECT Num_seats FROM Airplane WHERE Airline_Name = ? AND ID = ?",
          [f.Airline_Name, f.Airplane_ID]
        );

        const totalSeats = seatRows.length > 0 ? (seatRows[0] as any).Num_seats : 200;

        // Map to frontend format
        const depDateIso = formatFlightIdDatePart(f.Dep_date_time)
        return {
          id: buildFlightId(f.Airline_Name, f.Flight_number, f.Dep_date_time),
          airline: f.Airline_Name,
          flightNumber: f.Flight_number,
          depAirport: f.Dep_Airport_Code,
          arrAirport: f.Arr_Airport_Code,
          depDatetime: depDateIso,
          arrDatetime: formatFlightIdDatePart(f.Arr_date_time),
          basePrice: parseFloat(f.Base_price),
          status: f.Flight_Status === 'on-time' || f.Flight_Status === 'On-time' ? 'on-time' : 'delayed',
          passengers: passRows.length,
          totalSeats,
          passengerTickets: (passRows as any[]).map((t: any) => ({
            id: t.Ticket_ID,
            ticketId: t.Ticket_ID,
            customerEmail: t.Customer_Email,
            seatNumber: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
            purchaseDate: t.Purchase_date_time,
            price: parseFloat(f.Base_price),
            status: 'confirmed',
          })),
        };
      })
    );

    return res.json({ flights: flightsWithPassengers });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// 2. GET PASSENGERS FOR ONE FLIGHT
// ---------------------------------------------------------
export const getFlightPassengers = async (req: Request, res: Response) => {
  try {
    // Get username from session (pid for staff is their username)
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.role !== 'staff') {
      return res.status(401).json({ error: 'Unauthorized: Staff login required' })
    }
    const username = sessionUser.pid
    const { flightId } = req.params;

    // Parse flightId using helper function
    let airlineName: string, flightNumber: string, depDateTime: string;
    try {
      const parsed = parseFlightId(flightId);
      airlineName = parsed.airlineName;
      flightNumber = parsed.flightNumber;
      depDateTime = parsed.depDateTime;
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Invalid flight ID format' });
    }

    // DATABASE VERIFICATION: Query database to verify user is airline staff
    const [staffRows] = await db.query<any[]>(
      "SELECT Airline_Name FROM Airline_Staff WHERE Username = ?",
      [username]
    );

    if (staffRows.length === 0) {
      console.log(`❌ UNAUTHORIZED: User ${username} attempted to access flight passengers but is not in Airline_Staff table`)
      return res.status(403).json({ 
        error: "Unauthorized: You must be airline staff. User not found in staff database." 
      });
    }

    const staffAirline = (staffRows[0] as any).Airline_Name;
    console.log(`✅ AUTHORIZED: Verified ${username} is staff for airline ${staffAirline} via database query`)

    if (staffAirline !== airlineName) {
      return res.status(403).json({ error: "Not authorized for this flight" });
    }

    // Get passenger details
    const [rows] = await db.query<any[]>(
      `
      SELECT 
        Ticket_ID,
        Customer_Email,
        Purchase_date_time,
        Card_type
      FROM Ticket
      WHERE Airline_Name = ?
        AND Flight_number = ?
        AND Dep_date_time = ?
      `,
      [airlineName, flightNumber, depDateTime]
    );

    // Map to frontend format
    const passengers = (rows as any[]).map((t: any) => ({
      id: t.Ticket_ID,
      ticketId: t.Ticket_ID,
      customerEmail: t.Customer_Email,
      seatNumber: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
      purchaseDate: t.Purchase_date_time,
      status: 'confirmed',
    }));

    return res.json({ flightId, passengers });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// 3. CREATE A NEW FLIGHT
// ---------------------------------------------------------
export const createFlight = async (req: Request, res: Response) => {
  try {
    // Get username from session (pid for staff is their username)
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.role !== 'staff') {
      return res.status(401).json({ error: 'Unauthorized: Staff login required' })
    }
    const username = sessionUser.pid
    const data = req.body;

    // PRIMARY VERIFICATION: Query database to verify user is airline staff
    // This prevents unauthorized users from creating flights even if they bypass session checks
    const [staffRows] = await db.query<any[]>(
      "SELECT Airline_Name FROM Airline_Staff WHERE Username = ?",
      [username]
    );

    // Database verification: Check if user exists in Airline_Staff table
    if (staffRows.length === 0) {
      console.log(`❌ UNAUTHORIZED: User ${username} attempted to create flight but is not in Airline_Staff table`)
      return res.status(403).json({ 
        error: "Unauthorized: You must be airline staff to create flights. User not found in staff database." 
      });
    }

    const airline = staffRows[0].Airline_Name;
    console.log(`✅ AUTHORIZED: Verified ${username} is staff for airline ${airline} via database query`)

    // Validate required fields
    if (!data.flightNumber) {
      return res.status(400).json({ error: 'Flight number is required' });
    }
    if (!data.depDatetime) {
      return res.status(400).json({ error: 'Departure date and time is required' });
    }
    if (!data.arrDatetime) {
      return res.status(400).json({ error: 'Arrival date and time is required' });
    }
    if (!data.airplaneId) {
      return res.status(400).json({ error: 'Airplane ID is required' });
    }

    // Validate that arrival time is after departure time
    const depDate = new Date(data.depDatetime);
    const arrDate = new Date(data.arrDatetime);
    if (arrDate <= depDate) {
      return res.status(400).json({ error: 'Arrival date and time must be after departure date and time' });
    }

    // Validate that departure time is not in the past
    const now = new Date();
    if (depDate < now) {
      return res.status(400).json({ 
        error: 'Cannot create flights in the past. Departure date and time must be in the future.' 
      });
    }

    // Verify airplane exists and belongs to the staff's airline
    // First validate that airplaneId is a valid number
    const airplaneIdNum = parseInt(data.airplaneId, 10);
    if (isNaN(airplaneIdNum)) {
      return res.status(400).json({ error: `Invalid airplane ID: must be a number` });
    }

    const [airplaneRows] = await db.query<any[]>(
      "SELECT * FROM Airplane WHERE Airline_Name = ? AND ID = ?",
      [airline, airplaneIdNum]
    );

    if (airplaneRows.length === 0) {
      return res.status(404).json({ error: `Airplane with ID ${data.airplaneId} not found for your airline` });
    }

    // Check if flight with same airline name, flight number, and departure date/time already exists
    // No two flights can have the same combination of these three fields
    const [existingFlights] = await db.query<any[]>(
      `
      SELECT * FROM Flight
      WHERE Airline_Name = ?
        AND Flight_number = ?
        AND Dep_date_time = ?
      `,
      [airline, data.flightNumber, data.depDatetime]
    );

    if (existingFlights.length > 0) {
      return res.status(400).json({ 
        error: `A flight with the same airline name (${airline}), flight number (${data.flightNumber}), and departure date/time (${data.depDatetime}) already exists. Each flight must have a unique combination of these three fields.` 
      });
    }

    // Insert flight
    await db.query(
      `
      INSERT INTO Flight 
      (Airline_Name, Flight_number, Dep_date_time, Arr_date_time, Base_price, Flight_Status, Dep_Airport_Code, Arr_Airport_Code, Airplane_ID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        airline,
        data.flightNumber,
        data.depDatetime,
        data.arrDatetime,
        data.basePrice,
        data.status || "on-time",
        data.depAirport,
        data.arrAirport,
        data.airplaneId
      ]
    );

    return res.json({ success: true });

  } catch (err: any) {
    // Handle duplicate key error (in case the check above didn't catch it)
    // The database has a composite primary key on (Airline_Name, Flight_number, Dep_date_time)
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate entry')) {
      return res.status(400).json({ 
        error: 'A flight with the same airline name, flight number, and departure date/time already exists. Each flight must have a unique combination of these three fields.' 
      });
    }
    return res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// 4. CHANGE FLIGHT STATUS
// ---------------------------------------------------------
export const changeFlightStatus = async (req: Request, res: Response) => {
  try {
    // Get username from session (pid for staff is their username)
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.role !== 'staff') {
      return res.status(401).json({ error: 'Unauthorized: Staff login required' })
    }
    const username = sessionUser.pid
    const { flightId } = req.params;
    const { status } = req.body;

    // Parse flightId using helper function
    let airlineName: string, flightNumber: string, depDateTime: string;
    try {
      const parsed = parseFlightId(flightId);
      airlineName = parsed.airlineName;
      flightNumber = parsed.flightNumber;
      depDateTime = parsed.depDateTime;
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Invalid flight ID format' });
    }

    // DATABASE VERIFICATION: Query database to verify user is airline staff
    const [staffRows] = await db.query<any[]>(
      "SELECT Airline_Name FROM Airline_Staff WHERE Username = ?",
      [username]
    );

    if (staffRows.length === 0) {
      console.log(`❌ UNAUTHORIZED: User ${username} attempted to change flight status but is not in Airline_Staff table`)
      return res.status(403).json({ 
        error: "Unauthorized: You must be airline staff. User not found in staff database." 
      });
    }

    const staffAirline = (staffRows[0] as any).Airline_Name;
    console.log(`✅ AUTHORIZED: Verified ${username} is staff for airline ${staffAirline} via database query`)

    if (staffAirline !== airlineName) {
      return res.status(403).json({ error: "Not authorized for this flight" });
    }

    // Check if flight exists and get its departure date/time
    const [flightRows] = await db.query<any[]>(
      `
      SELECT Dep_date_time FROM Flight
      WHERE Airline_Name = ?
        AND Flight_number = ?
        AND Dep_date_time = ?
      `,
      [airlineName, flightNumber, depDateTime]
    );

    if (flightRows.length === 0) {
      return res.status(404).json({ error: "Flight not found" });
    }

    // Check if the flight's departure date/time is in the past
    const flightDepDateTime = new Date(flightRows[0].Dep_date_time);
    const now = new Date();
    
    if (flightDepDateTime < now) {
      return res.status(400).json({ 
        error: "Cannot change status for flights in the past. The flight's departure time has already passed." 
      });
    }

    await db.query(
      `
      UPDATE Flight
      SET Flight_Status = ?
      WHERE Airline_Name = ?
        AND Flight_number = ?
        AND Dep_date_time = ?
      `,
      [status, airlineName, flightNumber, depDateTime]
    );

    return res.json({ success: true, flight: { id: flightId, status } });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// 5. GET ALL AIRPLANES FOR STAFF'S AIRLINE
// ---------------------------------------------------------
export const getAirplanes = async (req: Request, res: Response) => {
  // Get username from session (pid for staff is their username)
  const sessionUser = getSessionUser(req)
  if (!sessionUser || sessionUser.role !== 'staff') {
    return res.status(401).json({ error: 'Unauthorized: Staff login required' })
  }
  const username = sessionUser.pid

  // DATABASE VERIFICATION: Query database to verify user is airline staff
  const [staffRows] = await db.query<any[]>(
    "SELECT Airline_Name FROM Airline_Staff WHERE Username = ?",
    [username]
  );

  if (staffRows.length === 0) {
    console.log(`❌ UNAUTHORIZED: User ${username} attempted to get airplanes but is not in Airline_Staff table`)
    return res.status(403).json({ 
      error: "Unauthorized: You must be airline staff. User not found in staff database." 
    });
  }

  const airline = staffRows[0].Airline_Name;
  console.log(`✅ AUTHORIZED: Verified ${username} is staff for airline ${airline} via database query`)

  const [rows] = await db.query<any[]>(
    "SELECT * FROM Airplane WHERE Airline_Name = ?",
    [airline]
  );

  // Map to frontend format
  const airplanes = (rows as any[]).map((row: any) => ({
    id: row.ID,
    airplaneId: row.ID,
    numberOfSeats: row.Num_seats,
    manufacturer: row.Manufacturing_company,
    age: row.Age,
    airlineName: row.Airline_Name,
  }));

  return res.json({ airplanes });
};

// ---------------------------------------------------------
// 6. ADD AN AIRPLANE
// ---------------------------------------------------------
export const addAirplane = async (req: Request, res: Response) => {
  // Get username from session (pid for staff is their username)
  const sessionUser = getSessionUser(req)
  if (!sessionUser || sessionUser.role !== 'staff') {
    return res.status(401).json({ error: 'Unauthorized: Staff login required' })
  }
  const username = sessionUser.pid
  const data = req.body;

  // DATABASE VERIFICATION: Query database to verify user is airline staff
  const [staffRows] = await db.query<any[]>(
    "SELECT Airline_Name FROM Airline_Staff WHERE Username = ?",
    [username]
  );

  if (staffRows.length === 0) {
    console.log(`❌ UNAUTHORIZED: User ${username} attempted to add airplane but is not in Airline_Staff table`)
    return res.status(403).json({ 
      error: "Unauthorized: You must be airline staff to add airplanes. User not found in staff database." 
    });
  }

  const airline = staffRows[0].Airline_Name;
  console.log(`✅ AUTHORIZED: Verified ${username} is staff for airline ${airline} via database query`)

  await db.query(
    `
    INSERT INTO Airplane (Airline_Name, ID, Num_seats, Manufacturing_company, Age)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      airline,
      data.airplaneId,
      data.numberOfSeats,
      data.manufacturer,
      data.age
    ]
  );

  // Return updated list
  const [rows] = await db.query<any[]>(
    "SELECT * FROM Airplane WHERE Airline_Name = ?",
    [airline]
  );

  // Map to frontend format
  const airplanes = (rows as any[]).map((row: any) => ({
    id: row.ID,
    airplaneId: row.ID,
    numberOfSeats: row.Num_seats,
    manufacturer: row.Manufacturing_company,
    age: row.Age,
    airlineName: row.Airline_Name,
  }));

  return res.json({ success: true, airplanes });
};
