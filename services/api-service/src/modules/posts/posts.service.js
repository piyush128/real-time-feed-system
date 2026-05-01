import { createPost as createPostInDB } from "./posts.repository.js";

export async function createPost(userId, caption) {
    const post = await createPostInDB(userId, caption);
    return post;
}
