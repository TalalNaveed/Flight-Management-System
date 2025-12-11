import { Request, Response } from "express";
import { db } from "../config/db";
import { getSessionUser } from '../middleware/auth.middleware'

export const getSalesReports = async (req: Request, res: Response) => {
  try {
    // Get staff username from session
    const sessionUser = getSessionUser(req)
    if (!sessionUser || sessionUser.role !== 'staff') {
      return res.status(401).json({ error: 'Unauthorized: Staff login required' })
    }
    const username = sessionUser.pid

    // Get staff's airline
    const [staffRows] = await db.query<any[]>(
      "SELECT Airline_Name FROM Airline_Staff WHERE Username = ?",
      [username]
    );

    if (staffRows.length === 0) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const airline = staffRows[0].Airline_Name;

    const { from, to } = req.query;

    let sql = `
      SELECT 
        DATE_FORMAT(T.Purchase_date_time, '%Y-%m') AS month,
        COUNT(*) AS ticketsSold,
        SUM(F.Base_price) AS revenue
      FROM Ticket T
      JOIN Flight F 
        ON F.Airline_Name = T.Airline_Name
       AND F.Flight_number = T.Flight_number
       AND F.Dep_date_time = T.Dep_date_time
      WHERE F.Airline_Name = ?
    `;

    const params: any[] = [airline];

    // Filter by date range
    if (from) {
      sql += " AND DATE(T.Purchase_date_time) >= ?";
      params.push(from);
    }

    if (to) {
      sql += " AND DATE(T.Purchase_date_time) <= ?";
      params.push(to);
    }

    sql += `
      GROUP BY month
      ORDER BY month
    `;

    const [rows] = await db.query<any[]>(sql, params);

    // Map to frontend format
    const monthly = (rows as any[]).map((row: any) => ({
      month: row.month,
      ticketsSold: parseInt(row.ticketsSold) || 0,
      revenue: parseFloat(row.revenue) || 0,
    }));

    const total = monthly.reduce((sum, m) => sum + m.ticketsSold, 0);

    res.json({
      monthly,
      total
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
