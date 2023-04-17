
export default function CancelFriendRequest(receiverId, senderId) {
    const currentUserId = receiverId;
    const profileUid = senderId
    const URL_REJECT_FRIEND_REQUEST = `/api/user/friend-reject/${currentUserId}/${profileUid}`;
    return fetch(URL_REJECT_FRIEND_REQUEST, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        }
    });


}
