import { createPost as createPostInDB } from "./posts.repository.js";
import { publishEvent } from "../../../../../shared/kafka/producer.js";

export async function createPost(userId, caption) {
    let post = null;
    try {
        post = await createPostInDB(userId, caption);
    } catch (error) {
        throw error;
    }
    try {
        await publishEvent('post_created', {
            userId: post.user_id,
            postId: post.post_id
        });
    } catch (error) {
        console.log('Error in Kafka ', error);
    }

    return post;
}
