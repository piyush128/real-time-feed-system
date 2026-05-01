import { findUserById } from '../auth/auth.repository.js';
import { getFollowStatus, followUser as followUserInDB } from './follow.repository.js';

export async function followUser(followerId, followingId) {
    const status = await getFollowStatus(followerId, followingId);
    if(status){
        throw new Error('Already Following');
    }

    const user = await findUserById(followingId);
    const isPrivateAccount = user.is_private;

    const follow = await (isPrivateAccount ? followUserInDB(followerId, followingId, 'pending'): followUserInDB(followerId, followingId, 'accepted'));
    return follow; 
}