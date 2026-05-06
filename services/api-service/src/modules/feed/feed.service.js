import { getFeed, getPostsByIds, getPostByUserId} from "./feed.repository.js";
import { redisClient } from "../../../../../shared/redis/index.js";
import pool from "../../../../../shared/db/index.js";

export async function showFeed(userId) {
    try {
        const cachedIds = await redisClient.zrevrange(`feed:${userId}`, 0, 19);
        if (cachedIds.length > 0) {
            console.log('Cache hit');
            return await getPostsByIds(cachedIds);
        }
    } catch (error) {
        console.error('Redis read failed, falling back to DB:', error.message);
    }

    const posts = await getFeed(userId);

    try {
        for (const p of posts) {
            await redisClient.zadd(`feed:${userId}`, new Date(p.created_at).getTime(), String(p.post_id));
        }
        await redisClient.expire(`feed:${userId}`, 3600);
    } catch (error) {
        console.error('Redis write failed:', error.message);
    }

    console.log('Cache miss');
    return posts;
}

export async function showMergedFeed(userId) {
    const celebrityList = [];

    const result = await pool.query(`SELECT f.following_id, u.is_celebrity
        FROM followers f
        JOIN users u ON f.following_id = u.user_id
        WHERE f.follower_id = $1 and f.status = 'accepted'`, [userId]);

    const celebrities = result.rows;

    for(const celebrity of celebrities){
        if(celebrity.is_celebrity){
            celebrityList.push(celebrity.following_id);
        }
    }

    const mergedFeed = [];
    const feed1 = await getPostByUserId(celebrityList);
    mergedFeed.push(...feed1);

    const feed2 = await getFeed(userId);
    mergedFeed.push(...feed2);
    
    mergedFeed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return mergedFeed;
}