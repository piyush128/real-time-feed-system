import { showFeed } from "./feed.service.js";

export async function feedController(req, res) {
    try {
        const userId = req.user.user_id;
        const feed = await showFeed(userId);
        res.status(200).json({ feed });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}