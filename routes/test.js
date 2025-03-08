const express = require("express");
const router = express.Router();
const { pool } = require("../db");
require("dotenv").config()

//give test curl
// curl -X POST -H "Content-Type: application/json" -d '{"name":"test1","type":"blood","syrum":"blood","routienTime":"2021-09-01"}' http://localhost:3000/
router.post("/", async (req, res) => {
    try{
        const { name, type, syrum, routienTime } = req.body;
        //rotine time should be in time without time zone
        
        if (!name || !type || !syrum || !routienTime) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const insertTestQuery = `
            INSERT INTO public.test (name, type, syrum, routienTime) 
            VALUES ($1, $2, $3, $4) RETURNING id;
        `;
        await pool.query(insertTestQuery, [name, type, syrum, routienTime]);
        res.status(201).json({ success: true, message: "Test created!" });    }
catch(e){
    res.status(500).json({ error: "Test failed", details: e.message });
}
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, type, syrum, routienTime FROM public.test");
        res.json({ success: true, test: result.rows });
    } catch (error) {
        console.error("Error fetching test:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT id, name, type, syrum, routienTime FROM public.test WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Test not found" });
        }
        res.json({ success: true, test: result.rows });
    } catch (error) {
        console.error("Error fetching test:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


// router.delete("/:id", async (req, res) => {
//     const { id } = req.params;
//     try {
//         const result = await pool.query("DELETE FROM public.test WHERE id = $1", [id]);
//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: "Test not found" });
//         }
//         res.json({ success: true, message: "Test deleted" });
//     } catch (error) {
//         console.error("Error deleting test:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// })

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, type, syrum, routienTime } = req.body;
    try {
        const updateTestQuery = `
            UPDATE public.test
            SET name = $1, type = $2, syrum = $3, routienTime = $4
            WHERE id = $5;
        `;
        await pool.query(updateTestQuery, [name, type, syrum, routienTime, id]);
        res.json({ success: true, message: "Test updated!" });
    } catch (error) {
        console.error("Error updating test:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})



module.exports = router;