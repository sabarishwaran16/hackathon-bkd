const express = require("express");
const router = express.Router();
const { pool } = require("../db");
require("dotenv").config();


router.post("/", async (req, res) => {
    try{
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "name is required" });
        }
        const insertTestQuery = `
            INSERT INTO public.test (name) 
            VALUES ($1) RETURNING id;
        `;
        await pool.query(insertTestQuery, [name]);
        res.status(201).json({ success: true, message: "Role created!" });    }
catch(e){
    res.status(500).json({ error: "Role failed", details: e.message });
}
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT name FROM public.test");
        res.json({ success: true, role: result.rows });
    } catch (error) {
        console.error("Error fetching test:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(" name FROM public.test WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Role not found" });
        }
        res.json({ success: true, role: result.rows });
    } catch (error) {
        console.error("Error fetching test:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM public.test WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Role not found" });
        }
        res.json({ success: true, message: "Role deleted" });
    } catch (error) {
        console.error("Error deleting role:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const updateTestQuery = `
            UPDATE public.test
            SET name = $1,
            WHERE id = $2;
        `;
        await pool.query(updateTestQuery, [name,id]);
        res.json({ success: true, message: "Role updated!" });
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})



module.exports = router;