import { createPost } from "./posts.service.js";

export async function createPostController(req, res) {
    try {
        const {caption} = req.body;
        const userId = req.user.user_id;

        const post =  await createPost(userId, caption);
        res.status(201).json({post});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}