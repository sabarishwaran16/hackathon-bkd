const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { pool } = require("../db");

router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        let result;
        if (user.role_name !== "doctor") {
            result = await pool.query(`
                SELECT u.id, ud.*
                FROM users u
                Inner JOIN userDetails ud ON u.userDetailId = ud.id
                WHERE ud.reportingPerson = u.name
            `);
        } else if (user.role_name === "patient") {
            result = await pool.query(`
                SELECT 
                    u.id as userId, u.name as userName, u.email as userEmail, 
                    t.id as testId, t.metrics, t.nextVisit, t.disaseId 
                FROM 
                    public.users u 
                Inner JOIN 
                    public.userDetails ud 
                ON 
                    u.userDetailId = ud.id 
                Inner JOIN 
                    public.testDetails t 
                ON 
                    ud.id = t.userDetailId 
                WHERE 
                    u.id = $1
            `, [user.id]);
        }
        res.status(200).json({ success: true, message: "Success!", data: result.rows });
    }
    catch (e) {
        res.status(500).json({ error: "Test Details failed", details: e.message });
    }
});