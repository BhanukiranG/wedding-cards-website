import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await db.query(query, [username.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const secret = process.env.JWT_SECRET || "super_secret_wedding_invitations_key_2026";
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error during authentication." });
  }
}

export async function register(req: Request, res: Response) {
  const { username, password, fullName, role } = req.body;

  if (!username || !password || !fullName) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if user already exists
    const checkUser = await db.query("SELECT id FROM users WHERE username = $1", [username.toLowerCase()]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const insertQuery = `
      INSERT INTO users (username, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, full_name, role
    `;
    const result = await db.query(insertQuery, [
      username.toLowerCase(),
      hash,
      fullName,
      role || "Distributor"
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error during user registration." });
  }
}
