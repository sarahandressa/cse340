const pool = require("../database")

async function addReview(inv_id, account_id, review_text) {
    try{
        const sql = "INSERT INTO review (inv_id, account_id, review_text) VALUES ($1, $2, $3)"
        await pool.query(sql, [inv_id, account_id, review_text])
    } catch (error) {
        console.error("addReview error:", error)
    }
}

async function getReviewsByVehiclesId(inv_id) {
    try {
        const sql = `SELECT r.review_text, r.review_date, a.account_firstname
                     FROM review r
                     JOIN account a ON r.account_id = a.account_id
                     WHERE r.inv_id = $1
                     ORDER BY r.review_date DESC`
        const result = await pool.query(sql, [inv_id])
        return result.rows
    } catch (error) {
      console.error("getReviewsByVehicleId error:", error)
      return []  
    } 
}

module.exports = { addReview, getReviewsByVehiclesId }