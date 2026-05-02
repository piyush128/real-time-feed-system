import pool from "../../../../../shared/db/index.js";

export async function getFeed(userId) {
    const result = await pool.query(`
        SELECT p.post_id, p.caption, p.created_at, u.username AS author
        FROM feed f
        JOIN posts p ON f.post_id = p.post_id
        JOIN users u ON p.user_id = u.user_id
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC
        LIMIT 20
      `, [userId]); 
    
    return result.rows;
}
