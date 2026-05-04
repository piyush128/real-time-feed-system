import { followUser, acceptFollowRequest, rejectFollowRequest} from "./follow.service.js";

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

export async function acceptFollowRequestController(req, res) {
    try {
        const followingId = req.user.user_id;
        const followerId = req.params.followerId;
        const follow = await acceptFollowRequest(followingId, followerId);
        const message = 'Follow request accepted';
        res.status(200).json({ follow, message });

    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export async function rejectFollowRequestController(req, res) {
    try {
        const followingId = req.user.user_id;
        const followerId = req.params.followerId;
        const follow = await rejectFollowRequest(followingId, followerId);
        const message = 'Follow request rejected';
        res.status(200).json({ follow, message });

    } catch (error) {
        res.status(400).json({error: error.message});
    }
}