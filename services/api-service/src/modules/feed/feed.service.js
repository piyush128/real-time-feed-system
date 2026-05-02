import { getFeed, getPostsByIds} from "./feed.repository.js";
import { redisClient } from "../../../../../shared/redis/index.js";

export async function showFeed(userId) {
    const cachedIds = await redisClient.zrevrange(`feed:${userId}`, 0, 19);
    if(cachedIds.length > 0){
        const cachedFeed = await getPostsByIds(cachedIds);
        console.log('Cache hit');
        return cachedFeed;
    }
    const posts = await getFeed(userId);
    for (const p of posts) {
        await redisClient.zadd(`feed:${userId}`, new Date(p.created_at).getTime(), String(p.post_id));
      }
    await redisClient.expire(`feed:${userId}`, 3600);
    console.log('Cache miss');
    return posts;
}