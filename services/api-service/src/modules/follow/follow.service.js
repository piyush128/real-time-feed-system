import { findUserById } from '../auth/auth.repository.js';
import { getFollowStatus, followUser as followUserInDB, updateFollowStatus} from './follow.repository.js';

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

export async function acceptFollowRequest(currentUserId, followerId){
    const follow = await getFollowStatus(followerId, currentUserId);
    if (!follow) throw new Error('Follow request not found');
    if (follow.status !== 'pending') throw new Error('No pending request');

    const result = await updateFollowStatus(followerId, currentUserId, 'accepted');
    return result;
}

export async function rejectFollowRequest(currentUserId, followerId){
    const follow = await getFollowStatus(followerId, currentUserId);
    if (!follow) throw new Error('Follow request not found');
    if (follow.status !== 'pending') throw new Error('No pending request');

    const result = await updateFollowStatus(followerId, currentUserId, 'rejected');
    return result;
}