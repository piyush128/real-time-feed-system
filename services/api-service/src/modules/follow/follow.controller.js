import { followUser } from "./follow.service.js";

export async function followController(req, res) {
    try {
        const followerId = req.user.user_id;
        const followingId = req.params.userId;
        const follow = await followUser(followerId, followingId);
        const message = follow.status === 'accepted' ? 'Now following' : 'Follow request sent';
        res.status(200).json({ follow, message });

    } catch (error) {
        res.status(500).json({error: error.message});
    }
}