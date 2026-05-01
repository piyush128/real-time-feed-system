import pool from "../../config/db.js";

export async function findUserByEmail(email){
    const result = await pool.query('select * from users where email = $1', [email]);
    return result.rows[0];
}

export async function createUser(username, email, passwordHash) {
    const result  = await pool.query('insert into users (username, email, password_hash) values ($1, $2, $3) RETURNING user_id, username, email', [username, email, passwordHash])
    return result.rows[0];
}

export async function findUserByUsername(username){
    const result = await pool.query('select * from users where username = $1', [username]);
    return result.rows[0];
}

export async function findUserById(userId){
    const result = await pool.query('select * from users where user_id = $1', [userId]);
    return result.rows[0];
}