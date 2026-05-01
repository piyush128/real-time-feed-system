import { getFeed } from "./feed.repository.js";

export async function showFeed(userId) {
    const feed = await getFeed(userId);
    return feed;
}