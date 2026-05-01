import pool from "../../config/db.js"; 

export async function createPost(userId, caption) {
    const result =  await pool.query('insert into posts (user_id, caption) values ($1, $2) RETURNING post_id, user_id, caption, created_at', [userId, caption]);
    return result.rows[0];
} 