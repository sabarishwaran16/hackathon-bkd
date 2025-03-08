const express = require("express");
const { pool } = require("../db");
const router = express.Router();

//give desise curl
// curl -X POST -H "Content-Type: application/json" -d '{"name":"test1","testId":[1,2]}' http://localhost:3000/


router.post("/", async (req, res) => {
    try{
        const { name, testId } = req.body;
        if (!name || !testId) {
            return res.status(400).json({ error: "All fields are required" });
        }
        //testId should be an array of integers
        const insertDisaseQuery = `
            INSERT INTO public.disase (name, testId) 
            VALUES ($1, ARRAY[$2::int[]]) RETURNING id;
        `;
        await pool.query(insertDisaseQuery, [name, testId]);
        
        res.status(201).json({ success: true, message: "Disase created!" });    }
catch(e){
    res.status(500).json({ error: "Disase failed", details: e.message });
}
}
)

router.get("/", async (req, res) => {
    try {
        //write test left join give test_id and testname 
        const query = `
            SELECT d.id, d.name, d.testId, t.name as test_name
            FROM public.disase d
            LEFT JOIN public.test t ON t.id = ANY(d.testId);
        `;
        const result = await pool.query(query);
        res.json({ success: true, disase: result.rows });
    } catch (error) {
        console.error("Error fetching disase:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT d.id, d.name, d.testId, t.name as test_name
            FROM public.disase d
            LEFT JOIN public.test t ON t.id = ANY(d.testId)
            WHERE d.id = $1;
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Disase not found" });
        }
        res.json({ success: true, disase: result.rows });
    } catch (error) {
        console.error("Error fetching disase:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
router.get("/:id/user/:userid/testdetails", async (req, res) => {
    const { id ,userid} = req.params;
   try{
    const query = ` SELECT td.id, td.userId, td.testId, td.metrics, td.nextVisit, td.disaseId, t.name as test_name, d.name as disase_name
    FROM public.testDetails td
    LEFT JOIN public.test t ON t.id = td.testId
    LEFT JOIN public.disase d ON d.id = td.disaseId
    WHERE td.userId = $1 AND td.disaseId = $2;`;

   const result = await pool.query(query, [userid, id]);
        res.json({ success: true, disase: result.rows });
    } catch (error) {
        console.error("Error fetching disase:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, testId } = req.body;
    try {
        const updateDisaseQuery = `
            UPDATE public.disase
            SET name = $1, testId = ARRAY[$2::int[]]
            WHERE id = $3;
        `;
        await pool.query(updateDisaseQuery, [name, testId, id]);
        res.json({ success: true, message: "Disase updated!" });
    } catch (error) {
        console.error("Error updating disase:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deleteDisaseQuery = `
            DELETE FROM public.disase
            WHERE id = $1 CASCADE;
        `;
        await pool.query(deleteDisaseQuery, [id]);
        res.json({ success: true, message: "Disase deleted!" });
    } catch (error) {
        console.error("Error deleting disase:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


module.exports = router