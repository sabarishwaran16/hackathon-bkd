const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config()

//give testDetails curl

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { userId, testId, metrics, nextVisit, disaseId } = req.body;
        if (!userId || !testId || !metrics || !disaseId) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const insertTestDetailsQuery = `
            INSERT INTO public.testDetails (userId, testId, metrics, nextvisit , disaseId) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;
        await pool.query(insertTestDetailsQuery, [userId, testId, metrics, nextVisit, disaseId]);
        res.status(201).json({ success: true, message: "Test Details created!" });
    }
    catch (e) {
        res.status(500).json({ error: "Test Details failed", details: e.message });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query("SELECT id, userId, testId, metrics, nextVisit, disaseId FROM public.testDetails");
        res.json({ success: true, testDetails: result.rows });
    } catch (error) {
        console.error("Error fetching testDetails:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/:userId", authMiddleware, async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query("SELECT id, userId, testId, metrics, nextVisit, disaseId FROM public.testDetails WHERE userId = $1", [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Test Details not found" });
        }
        res.json({ success: true, testDetails: result.rows });
    } catch (error) {
        console.error("Error fetching testDetails:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.put("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { userId, testId, metrics, nextVisit, disaseId } = req.body;
    try {
        const updateTestDetailsQuery = `
            UPDATE public.testDetails
            SET userId = $1, testId = $2, metrics = $3, nextVisit = $4, disaseId = $5
            WHERE id = $6;
        `;
        await pool.query(updateTestDetailsQuery, [userId, testId, metrics, nextVisit, disaseId, id]);
        res.json({ success: true, message: "Test Details updated!" });
    } catch (error) {
        console.error("Error updating testDetails:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const deleteTestDetailsQuery = `
            DELETE FROM public.testDetails
            WHERE id = $1;
        `;
        await pool.query(deleteTestDetailsQuery, [id]);
        res.json({ success: true, message: "Test Details deleted!" });
    } catch (error) {
        console.error("Error deleting testDetails:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})





module.exports = router;