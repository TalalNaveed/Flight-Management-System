import { Request, Response } from "express";
import { db } from "../config/db";
import { buildFlightId, parseFlightId } from "../utils/auth.utils";
import { getSessionUser } from '../middleware/auth.middleware'

export const submitRating = async (req: Request, res: Response) => {
  try {
    // Get customer email from session (pid for customers is their email)
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.role !== 'customer') {
      return res.status(401).json({ error: 'Unauthorized: Customer login required' })
    }
    const customerEmail = sessionUser.pid
    
    const { flightId, rating, comment } = req.body;

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

    // INSERT rating into Review table (no Review_date column in schema)
    await db.query(
      `
      INSERT INTO Review 
        (Customer_Email, Airline_Name, Flight_number, Dep_date_time, Rating, Comments)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        customerEmail,
        airlineName,
        flightNumber,
        depDateTime,
        parseInt(rating),
        comment || null
      ]
    );

    res.json({
      success: true,
      rating: {
        id: `${customerEmail}_${airlineName}_${flightNumber}_${depDateTime}`,
        flightId,
        customerEmail,
        airline: airlineName,
        flightNumber,
        rating: parseInt(rating),
        comment: comment || '',
        date: new Date().toISOString(),
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerRatings = async (req: Request, res: Response) => {
  try {
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.role !== 'customer') {
      return res.status(401).json({ error: 'Unauthorized: Customer login required' })
    }

    const customerEmail = sessionUser.pid

    const [rows] = await db.query<any[]>(
      `SELECT * FROM Review WHERE Customer_Email = ?`,
      [customerEmail]
    )

    const ratings = (rows as any[]).map((row: any) => ({
      id: `${row.Customer_Email}_${row.Airline_Name}_${row.Flight_number}_${row.Dep_date_time}`,
      flightId: buildFlightId(row.Airline_Name, row.Flight_number, row.Dep_date_time),
      airline: row.Airline_Name,
      flightNumber: row.Flight_number,
      rating: row.Rating,
      comment: row.Comments || '',
      customerEmail: row.Customer_Email,
      date: new Date().toISOString()
    }))

    return res.json({ ratings })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
