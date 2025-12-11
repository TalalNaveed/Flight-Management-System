import { Request, Response } from 'express'
import { db } from "../config/db";
import { buildFlightId, formatFlightIdDatePart, parseFlightId } from "../utils/auth.utils";

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const {
      fromCity,
      toCity,
      departureDate,
      page = "1",
      pageSize = "5"
    } = req.query;

    console.log('Search params:', { fromCity, toCity, departureDate, page, pageSize });

    const pageNum = parseInt(typeof page === 'string' ? page : '1');
    const size = parseInt(typeof pageSize === 'string' ? pageSize : '5');
    const offset = (pageNum - 1) * size;

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
        dep.City AS Dep_City,
        dep.Country AS Dep_Country,
        arr.City AS Arr_City,
        arr.Country AS Arr_Country
      FROM Flight f
      JOIN Airport dep ON dep.Airport_code = f.Dep_Airport_Code
      JOIN Airport arr ON arr.Airport_code = f.Arr_Airport_Code
      WHERE f.Dep_date_time >= NOW()
    `;

    const params: any[] = [];

    // Filter by departure city or airport code (exact match for codes, LIKE for cities)
    if (fromCity) {
      const fromCityStr = (fromCity as string).trim().toUpperCase();
      // If it's a 3-letter code, do exact match; otherwise search city
      if (fromCityStr.length === 3) {
        sql += " AND (f.Dep_Airport_Code = ? OR LOWER(dep.City) LIKE ?)";
        params.push(fromCityStr, `%${fromCityStr.toLowerCase()}%`);
      } else {
        sql += " AND (LOWER(dep.City) LIKE ? OR f.Dep_Airport_Code = ?)";
        params.push(`%${fromCityStr.toLowerCase()}%`, fromCityStr);
      }
    }

    // Filter by arrival city or airport code
    if (toCity) {
      const toCityStr = (toCity as string).trim().toUpperCase();
      if (toCityStr.length === 3) {
        sql += " AND (f.Arr_Airport_Code = ? OR LOWER(arr.City) LIKE ?)";
        params.push(toCityStr, `%${toCityStr.toLowerCase()}%`);
      } else {
        sql += " AND (LOWER(arr.City) LIKE ? OR f.Arr_Airport_Code = ?)";
        params.push(`%${toCityStr.toLowerCase()}%`, toCityStr);
      }
    }

    // Filter by date (only if provided)
    if (departureDate) {
      sql += " AND DATE(f.Dep_date_time) = ?";
      params.push(departureDate);
    }

    console.log('SQL:', sql);
    console.log('Params:', params);

    // Count query
    const [countRows] = await db.query(
      "SELECT COUNT(*) AS total FROM (" + sql + ") AS subquery",
      params
    );

    // Pagination
    sql += " ORDER BY f.Dep_date_time ASC LIMIT ? OFFSET ?";
    params.push(size, offset);

    const [rows] = await db.query<any[]>(sql, params);
    
    console.log('Found flights:', (rows as any[]).length);
    console.log('Flight rows:', JSON.stringify(rows, null, 2));

    // Map database fields to frontend expectations and calculate seats available
    const flights = await Promise.all(
      (rows as any[]).map(async (row: any) => {
        // Get airplane total seats (Airplane has composite key: Airline_Name, ID)
        const [airplaneRows] = await db.query<any[]>(
          `SELECT a.Num_seats FROM Airplane a
           JOIN Flight f ON f.Airplane_ID = a.ID AND f.Airline_Name = a.Airline_Name
           WHERE f.Airline_Name = ? AND f.Flight_number = ? AND f.Dep_date_time = ?`,
          [row.Airline_Name, row.Flight_number, row.Dep_date_time]
        );
        
        // Count booked tickets
        const [ticketRows] = await db.query<any[]>(
          `SELECT COUNT(*) AS booked FROM Ticket
           WHERE Airline_Name = ? AND Flight_number = ? AND Dep_date_time = ?`,
          [row.Airline_Name, row.Flight_number, row.Dep_date_time]
        );
        
        const totalSeats = airplaneRows.length > 0 ? (airplaneRows[0] as any).Num_seats : 200;
        const booked = ticketRows.length > 0 ? (ticketRows[0] as any).booked : 0;
        const seatsAvailable = Math.max(0, totalSeats - booked);

        const depDateIso = formatFlightIdDatePart(row.Dep_date_time)
        return {
          id: buildFlightId(row.Airline_Name, row.Flight_number, row.Dep_date_time),
          airline: row.Airline_Name,
          flightNumber: row.Flight_number,
          depAirport: row.Dep_Airport_Code,
          arrAirport: row.Arr_Airport_Code,
          depDatetime: depDateIso,
          arrDatetime: formatFlightIdDatePart(row.Arr_date_time),
          basePrice: parseFloat(row.Base_price),
          status: row.Flight_Status === 'on-time' || row.Flight_Status === 'On-time' ? 'on-time' : 'delayed',
          seatsAvailable,
          depCity: row.Dep_City,
          arrCity: row.Arr_City,
        };
      })
    );

    res.json({
      flights,
      total: (countRows as any)[0].total,
      page: pageNum,
      pageSize: size,
    });

  } catch (err) {
    console.error('Flight search error:', err);
    res.status(500).json({ 
      message: (err as Error).message,
      error: err 
    });
  }
};

export const getFlightRatings = async (req: Request, res: Response) => {
  try {
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

    const [ratings] = await db.query<any[]>(
      `SELECT * FROM Review 
       WHERE Airline_Name = ? AND Flight_number = ? AND Dep_date_time = ?`,
      [airlineName, flightNumber, depDateTime]
    );

    const mappedRatings = (ratings as any[]).map((r: any) => ({
      id: `${r.Customer_Email}_${r.Airline_Name}_${r.Flight_number}_${r.Dep_date_time}`,
      flightId: flightId,
      customerEmail: r.Customer_Email,
      rating: r.Rating,
      comment: r.Comments || '',
      date: new Date().toISOString(), // No Review_date column in schema
    }));

    const avgRating = mappedRatings.length > 0
      ? mappedRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / mappedRatings.length
      : 0;

    return res.json({
      flightId,
      averageRating: avgRating,
      totalRatings: mappedRatings.length,
      ratings: mappedRatings,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
