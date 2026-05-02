import { createPost as createPostInDB } from "./posts.repository.js";
import { publishEvent } from "../../../../../shared/kafka/producer.js";

export async function createPost(userId, caption) {
    const post = await createPostInDB(userId, caption);
    await publishEvent('post_created', {
        userId: post.user_id,
        postId: post.post_id
    });
    return post;
}
