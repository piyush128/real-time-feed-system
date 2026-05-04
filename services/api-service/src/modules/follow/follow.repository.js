import pool from "../../../../../shared/db/index.js";

export async function followUser(followerId, followingId, status) {
    const result = await pool.query('insert into followers (follower_id, following_id, status) values ($1, $2, $3) returning follower_id, following_id, status, created_at', [followerId, followingId, status])
    return result.rows[0];
}

export async function getFollowStatus(followerId, followingId) {
    const result = await pool.query('select status from followers where follower_id = $1 AND following_id = $2', [followerId, followingId]);
    return result.rows[0];
}

export async function updateFollowStatus(followerId, followingId, status){
    const result = await pool.query(`update followers set status = $1 where following_id = $2 and follower_id = $3 returning follower_id, following_id, status`,[status, followingId, followerId]);
    return result.rows;
}