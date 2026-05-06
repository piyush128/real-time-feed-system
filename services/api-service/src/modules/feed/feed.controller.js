import { showMergedFeed } from "./feed.service.js";

export async function feedController(req, res) {
    try {
        const userId = req.user.user_id;
        const feed = await showMergedFeed(userId);
        res.status(200).json({ feed });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}