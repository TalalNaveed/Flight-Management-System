import { Request, Response } from "express";
import { db } from "../config/db";
import { buildFlightId, parseFlightId } from "../utils/auth.utils";

// --------------------------------------------------
// 1. GET ALL CUSTOMER TICKETS
// --------------------------------------------------
import { getSessionUser } from '../middleware/auth.middleware'

export const getCustomerTickets = async (req: Request, res: Response) => {
  try {
    // Get email from session (pid for customers is their email)
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.role !== 'customer') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const email = sessionUser.pid
    const { dateFrom, dateTo } = req.query;

    let sql = `
      SELECT 
        t.Ticket_ID,
        t.Customer_Email,
        t.Purchase_date_time,
        t.Card_type,
        f.Airline_Name,
        f.Flight_number,
        f.Dep_date_time,
        f.Arr_date_time,
        f.Dep_Airport_Code,
        f.Arr_Airport_Code,
        f.Base_price,
        f.Flight_Status,
        f.Airplane_ID
      FROM Ticket t
      JOIN Flight f
        ON t.Airline_Name = f.Airline_Name
       AND t.Flight_number = f.Flight_number
       AND t.Dep_date_time = f.Dep_date_time
      WHERE t.Customer_Email = ?
    `;

    const params: any[] = [email];

    if (dateFrom) {
      sql += " AND DATE(f.Dep_date_time) >= ?";
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += " AND DATE(f.Dep_date_time) <= ?";
      params.push(dateTo);
    }

    sql += " ORDER BY f.Dep_date_time ASC";

    const [rows] = await db.query<any[]>(sql, params);

    // Map database fields to frontend expectations
    const tickets = (rows as any[]).map((row: any) => {
      // Construct flightId in format: Airline_Name_Flight_number_Dep_date_time
      const flightId = buildFlightId(row.Airline_Name, row.Flight_number, row.Dep_date_time);
      
      return {
        id: row.Ticket_ID,
        ticketId: row.Ticket_ID,
        flightId: flightId, // Add flightId for ratings
        customerEmail: row.Customer_Email,
        airline: row.Airline_Name,
        flightNumber: row.Flight_number,
        depAirport: row.Dep_Airport_Code,
        arrAirport: row.Arr_Airport_Code,
        depDatetime: row.Dep_date_time,
        arrDatetime: row.Arr_date_time,
        price: parseFloat(row.Base_price),
        basePrice: parseFloat(row.Base_price),
        purchaseDate: row.Purchase_date_time,
        status: row.Flight_Status || 'confirmed',
        flightStatus: row.Flight_Status || 'on-time',
        airplaneId: row.Airplane_ID,
        seatNumber: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`, // Generate seat if not in DB
      };
    });

    return res.json({ tickets });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 2. PURCHASE TICKET (INSERT INTO REAL DATABASE)
// --------------------------------------------------
export const purchaseTicket = async (req: Request, res: Response) => {
  try {
    const { flightId, payment } = req.body;

    console.log('Purchase request - flightId:', flightId);
    console.log('Purchase request - body:', req.body);

    // Get customer email from session (pid for customers is their email)
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.role !== 'customer') {
      return res.status(401).json({ error: 'Unauthorized: Customer login required' })
    }
    const customerEmail = sessionUser.pid

    // Parse flightId using helper function
    let airlineName: string, flightNumber: string, depDateTime: string;
    try {
      const parsed = parseFlightId(flightId);
      airlineName = parsed.airlineName;
      flightNumber = parsed.flightNumber;
      depDateTime = parsed.depDateTime;
      
      console.log('Parsed - airlineName:', airlineName);
      console.log('Parsed - flightNumber:', flightNumber);
      console.log('Parsed - depDateTime:', depDateTime);
    } catch (err: any) {
      console.error('Invalid flightId format:', flightId, err.message);
      return res.status(400).json({ error: err.message || 'Invalid flight ID format' });
    }

    const mysqlDepDateTime = depDateTime;

    console.log('Parsed - airlineName:', airlineName);
    console.log('Parsed - flightNumber:', flightNumber);
    console.log('Parsed - depDateTime:', depDateTime);
    console.log("DEBUG - mysql format you're actually querying with:", mysqlDepDateTime);

    const sanitize = (value: any) => (typeof value === 'string' ? value.trim() : '')
    const allowedCardTypes = ['credit', 'debit']
    const cardType = sanitize(payment?.cardType).toLowerCase()
    if (!allowedCardTypes.includes(cardType)) {
      return res.status(400).json({ field: 'cardType', error: 'Card type must be credit or debit' })
    }

    const rawCardNumber = sanitize(payment?.cardNumber).replace(/\s+/g, '')
    if (!rawCardNumber) {
      return res.status(400).json({ field: 'cardNumber', error: 'Card number is required' })
    }
    if (!/^\d+$/.test(rawCardNumber)) {
      return res.status(400).json({ field: 'cardNumber', error: 'Card number must contain only digits' })
    }
    if (rawCardNumber.length < 12 || rawCardNumber.length > 32) {
      return res.status(400).json({ field: 'cardNumber', error: 'Card number must be between 12 and 32 digits' })
    }
    const maskedCardNumber =
      rawCardNumber.length > 4
        ? `${'*'.repeat(rawCardNumber.length - 4)}${rawCardNumber.slice(-4)}`
        : rawCardNumber

    const nameOnCard = sanitize(payment?.nameOnCard)
    if (!nameOnCard) {
      return res.status(400).json({ field: 'nameOnCard', error: 'Name on card is required' })
    }
    if (nameOnCard.length > 120) {
      return res.status(400).json({ field: 'nameOnCard', error: 'Name on card is too long' })
    }

    const expiration = sanitize(payment?.expiration)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!expiryRegex.test(expiration)) {
      return res.status(400).json({ field: 'expiration', error: 'Expiry must be in MM/YY format' })
    }
    const [monthStr, yearStr] = expiration.split('/')
    const expiryDate = new Date(Number(`20${yearStr}`), Number(monthStr) - 1, 1)
    const endOfExpiryMonth = new Date(expiryDate.getFullYear(), expiryDate.getMonth() + 1, 0, 23, 59, 59)
    if (endOfExpiryMonth < new Date()) {
      return res.status(400).json({ field: 'expiration', error: 'Card is expired' })
    }

    // Use a transaction to avoid overselling seats
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Check flight exists and lock row
      const [flightRows] = await conn.query<any[]>(
        `
        SELECT * FROM Flight
        WHERE Airline_Name = ?
          AND Flight_number = ?
          AND Dep_date_time = ?
        FOR UPDATE
        `,
        [airlineName, flightNumber, mysqlDepDateTime]
      );

      console.log('Flight query result (tx):', (flightRows as any[]).length, 'rows found');

      if ((flightRows as any[]).length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: "Flight not found" });
      }

      // 2. Count tickets already booked and lock matching tickets
      const [countRows] = await conn.query<any[]>(
        `
        SELECT COUNT(*) AS booked
        FROM Ticket
        WHERE Airline_Name = ?
          AND Flight_number = ?
          AND Dep_date_time = ?
        FOR UPDATE
        `,
        [airlineName, flightNumber, mysqlDepDateTime]
      );

      const booked = (countRows[0] as any).booked;

      // 3. Get total seats for airplane (lock airplane row)
      const airplaneID = (flightRows[0] as any).Airplane_ID;
      const airlineNameForPlane = (flightRows[0] as any).Airline_Name;

      const [seatRows] = await conn.query<any[]>(
        "SELECT Num_seats FROM Airplane WHERE Airline_Name = ? AND ID = ? FOR UPDATE",
        [airlineNameForPlane, airplaneID]
      );

      const totalSeats = (seatRows[0] as any).Num_seats;

      if (booked >= totalSeats) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: "No seats available" });
      }

      // 4. Generate ticket ID (bigint, seems to be manually set)
      const ticketId = Date.now(); // Use timestamp as ticket ID

      // 5. Insert ticket with all required fields
      await conn.query(
        `
        INSERT INTO Ticket 
          (Ticket_ID, Customer_Email, Airline_Name, Flight_number, Dep_date_time, Purchase_date_time, Card_type, Card_number, Name_on_card, Expiry_date)
        VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
        `,
        [
          ticketId,
          customerEmail,
          airlineName,
          flightNumber,
          mysqlDepDateTime,
          cardType,
          maskedCardNumber,
          nameOnCard,
          expiration
        ]
      );

      await conn.commit();
      conn.release();

      return res.json({
        ticketId: `T${ticketId}`,
        ticket: {
          id: `T${ticketId}`,
          ticketId: `T${ticketId}`,
          flightId,
          customerEmail,
          airline: airlineName,
          flightNumber,
        }
      });
    } catch (innerErr: any) {
      try {
        await conn.rollback();
      } catch {}
      conn.release();
      throw innerErr;
    }

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
