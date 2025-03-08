const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
require("dotenv").config();
const authMiddleware = require("../middleware/authMiddleware");


router.post("/users/register", async (req, res) => {
  try {
    //need to add user details in this route if face any errors revoke use begin and commit
    const { name, mobile, email, password, userDetails, role } = req.body;
    if (!name || !mobile || !email || !password || !userDetails || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("BEGIN");
    // Insert user and get ID
    const insertUserQuery = `
        INSERT INTO public.users (name, mobile, email, password) 
        VALUES ($1, $2, $3, $4) RETURNING id;
    `;
    const userResult = await pool.query(insertUserQuery, [name, mobile, email, hashedPassword]);
    const userId = userResult.rows[0].id;
    // Insert user details
    const insertUserDetailsQuery = `
      INSERT INTO public.userDetails (street, door_no, district, state, pincode, blood_group, specialization, reportingPerson, nextVisit) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;
    `;
    const userDetailsResult = await pool.query(insertUserDetailsQuery, [
      userDetails.street || null,
      userDetails.door_no || null,
      userDetails.district || null,
      userDetails.state || null,
      userDetails.pincode || null,
      userDetails.blood_group || null,
      userDetails.specialization || null,
      userDetails.reportingPerson || null,
      userDetails.nextVisit || null
    ]);
    const userDetailId = userDetailsResult.rows[0].id;

    // Update user with userDetailId
    const updateUserQuery = `
      UPDATE public.users SET userDetailId = $1 WHERE id = $2;
    `;
    await pool.query(updateUserQuery, [userDetailId, userId])


    await pool.query("COMMIT");
    res.status(201).json({ success: true, message: "User registered!" });
  } catch (e) {
    res.status(500).json({ error: "User registration failed", details: e.message });
  }
})


// router.post("/users/register", async (req, res) => {
//   const { username, email, password ,userDetails} = req.body;
//   if (!username || !email || !password || !userDetails) {
//       return res.status(400).json({ error: "All fields are required" });
//   }


//   const hashedPassword = await bcrypt.hash(password, 10);
//   try {
//       await pool.query("BEGIN");

//       // Insert user and get ID
//       const insertUserQuery = `
//           INSERT INTO public.users (username, email, password) 
//           VALUES ($1, $2, $3) RETURNING id;
//       `;

//       const userResult = await pool.query(insertUserQuery, [username, email, hashedPassword]);
//       const userId = userResult.rows[0].id;


//       await pool.query("COMMIT");
//       res.status(201).json({ success: true, message: "User registered and workspace created!" });
//   } catch (error) {
//       await pool.query("ROLLBACK");


//       // Handle other errors
//       res.status(500).json({ error: "Registration failed", details: error.message });
//     }
// });


router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email, workspace_name FROM public.users");
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT id, username, email, workspace_name FROM public.users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//login details below

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Find user by email
    const userQuery = `SELECT id, username, email, password FROM public.users WHERE email = $1`;
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT Tokens
    const payload = { userId: user.id, email: user.email, username: user.username };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    // const storeTokenQuery = `UPDATE public.users SET refresh_token = $1 WHERE id = $2`;
    // await pool.query(storeTokenQuery, [refreshToken, user.id]);

    res.json({
      success: true,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token is required" });

  try {
    // Verify refresh token
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid refresh token" });

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: user.userId, email: user.email, username: user.username },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ error: "Token refresh failed", details: error.message });
  }
});

router.post("/logout", authMiddleware, async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

  try {
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", details: error.message });
  }
});

module.exports = router;