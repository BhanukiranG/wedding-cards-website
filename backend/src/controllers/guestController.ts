import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import db from "../config/db";

// --- GUEST CRUD ---
export async function getGuests(req: AuthenticatedRequest, res: Response) {
  const { search, status, city } = req.query;

  try {
    let query = `
      SELECT g.*, u.full_name as assigned_to_name 
      FROM guests g
      LEFT JOIN users u ON g.assigned_to_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (g.name ILIKE $${params.length} OR g.mobile ILIKE $${params.length} OR g.village ILIKE $${params.length} OR g.city ILIKE $${params.length})`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND g.status = $${params.length}`;
    }

    if (city && city !== "ALL") {
      params.push(city);
      query += ` AND g.city = $${params.length}`;
    }

    query += " ORDER BY g.name ASC";

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wedding guests registry." });
  }
}

export async function createGuest(req: AuthenticatedRequest, res: Response) {
  const { name, mobile, familyMembers, village, city, state, fullAddress, latitude, longitude, notes } = req.body;

  if (!name || !mobile || !city || !fullAddress) {
    return res.status(400).json({ error: "Missing required guest fields." });
  }

  try {
    const insertQuery = `
      INSERT INTO guests (name, mobile, family_members, village, city, state, full_address, latitude, longitude, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const result = await db.query(insertQuery, [
      name,
      mobile,
      familyMembers || 1,
      village || "General",
      city,
      state || "Andhra Pradesh",
      fullAddress,
      latitude,
      longitude,
      notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log new guest in database." });
  }
}

export async function updateGuest(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { name, mobile, familyMembers, village, city, state, fullAddress, latitude, longitude, notes, status, assignedToId, remarks } = req.body;

  try {
    // Check old status to see if it transitioned to Distributed
    const checkQuery = "SELECT status FROM guests WHERE id = $1";
    const checkResult = await db.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Guest record not found." });
    }
    
    const oldStatus = checkResult.rows[0].status;
    let distributedDate = null;
    let distributedTime = null;

    if (status === "Distributed") {
      if (oldStatus === "Distributed") {
        // Keep existing date
        const dateQuery = "SELECT distributed_date, distributed_time FROM guests WHERE id = $1";
        const dateResult = await db.query(dateQuery, [id]);
        distributedDate = dateResult.rows[0].distributed_date;
        distributedTime = dateResult.rows[0].distributed_time;
      } else {
        distributedDate = new Date().toISOString().split("T")[0];
        distributedTime = new Date().toTimeString().split(" ")[0].substring(0, 5);
      }
    }

    const updateQuery = `
      UPDATE guests 
      SET name = $1, mobile = $2, family_members = $3, village = $4, city = $5, state = $6, 
          full_address = $7, latitude = $8, longitude = $9, notes = $10, status = $11, 
          assigned_to_id = $12, remarks = $13, distributed_date = $14, distributed_time = $15
      WHERE id = $16
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      name, mobile, familyMembers, village, city, state, fullAddress, latitude, longitude, notes, 
      status, assignedToId || null, remarks || "", distributedDate, distributedTime, id
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update guest details." });
  }
}

export async function deleteGuest(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM guests WHERE id = $1", [id]);
    res.json({ message: "Guest record deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove guest." });
  }
}

// Quick deliver action
export async function markAsDelivered(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { remarks } = req.body;

  const todayStr = new Date().toISOString().split("T")[0];
  const timeStr = new Date().toTimeString().split(" ")[0].substring(0, 5);

  try {
    const query = `
      UPDATE guests
      SET status = 'Distributed', distributed_date = $1, distributed_time = $2, remarks = $3
      WHERE id = $4
      RETURNING *
    `;
    const result = await db.query(query, [todayStr, timeStr, remarks || "Marked delivered on mobile.", id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Guest record not found." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark delivery." });
  }
}

// --- STATS & ANALYTICS ---
export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const totalResult = await db.query("SELECT COUNT(*)::int as total, SUM(family_members)::int as guests FROM guests");
    const distResult = await db.query("SELECT COUNT(*)::int as count FROM guests WHERE status = 'Distributed'");
    const assignResult = await db.query("SELECT COUNT(*)::int as count FROM guests WHERE status = 'Assigned'");
    const pendResult = await db.query("SELECT COUNT(*)::int as count FROM guests WHERE status = 'Pending'");
    const locResult = await db.query("SELECT COUNT(DISTINCT(city || '-' || village))::int as count FROM guests");
    
    // Distributors leaderboard
    const leaderQuery = `
      SELECT u.id, u.full_name, u.role,
             COUNT(g.id)::int as assigned,
             COUNT(CASE WHEN g.status = 'Distributed' THEN 1 END)::int as distributed
      FROM users u
      LEFT JOIN guests g ON g.assigned_to_id = u.id
      GROUP BY u.id, u.full_name, u.role
    `;
    const leaderResult = await db.query(leaderQuery);

    const total = totalResult.rows[0].total || 0;
    const distributed = distResult.rows[0].count || 0;

    res.json({
      totalCards: total,
      distributed,
      assigned: assignResult.rows[0].count || 0,
      pending: pendResult.rows[0].count || 0,
      totalGuests: totalResult.rows[0].guests || 0,
      totalLocations: locResult.rows[0].count || 0,
      progressPerc: total > 0 ? Math.round((distributed / total) * 100) : 0,
      distributors: leaderResult.rows[0] ? leaderResult.rows : []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate dashboard statistics." });
  }
}

export async function getAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    // City metrics
    const cityQuery = `
      SELECT city, 
             COUNT(*)::int as total,
             COUNT(CASE WHEN status = 'Distributed' THEN 1 END)::int as distributed
      FROM guests
      GROUP BY city
    `;
    const cityResult = await db.query(cityQuery);

    // Status Share
    const statusQuery = `
      SELECT status, COUNT(*)::int as value
      FROM guests
      GROUP BY status
    `;
    const statusResult = await db.query(statusQuery);

    // Daily metrics (last 7 days)
    const dailyQuery = `
      SELECT distributed_date as date, COUNT(*)::int as delivered
      FROM guests
      WHERE status = 'Distributed' AND distributed_date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY distributed_date
      ORDER BY distributed_date ASC
    `;
    const dailyResult = await db.query(dailyQuery);

    res.json({
      cityData: cityResult.rows,
      statusData: statusResult.rows,
      dailyData: dailyResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve analytics data." });
  }
}

// Bulk Excel Import
export async function bulkImportGuests(req: AuthenticatedRequest, res: Response) {
  const { rows } = req.body; // Array of guest objects
  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ error: "Invalid import format. Expected array of rows." });
  }

  try {
    let imported = 0;
    for (const row of rows) {
      const name = row.name || row["Guest Name"];
      const mobile = row.mobile || row["Mobile Number"];
      const family = parseInt(row.familyMembers || row["Family Members"]) || 1;
      const village = row.village || row["Village / Area"] || "General";
      const city = row.city || row["City"] || "Hyderabad";
      const address = row.fullAddress || row["Full Address"] || "Andhra Pradesh";

      if (name && mobile) {
        // Check duplicate
        const dup = await db.query("SELECT id FROM guests WHERE mobile = $1", [String(mobile)]);
        if (dup.rows.length === 0) {
          await db.query(
            `INSERT INTO guests (name, mobile, family_members, village, city, full_address, status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'Pending')`,
            [String(name), String(mobile), family, String(village), String(city), String(address)]
          );
          imported++;
        }
      }
    }
    res.json({ message: `Successfully imported ${imported} new guests.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to complete bulk spreadsheet import." });
  }
}
