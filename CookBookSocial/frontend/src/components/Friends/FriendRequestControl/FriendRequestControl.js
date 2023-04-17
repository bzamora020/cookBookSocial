import React, { useState } from "react";
import "./FriendRequestControl.css";
import CancelFriendRequest from "../cancelFriendRequest/cancelFriendRequest";

export default function FriendRequestControl({ senderId, receiverId, setReceivedFriendRequests }) {
    const [isLoading, setIsLoading] = useState(false);

    const URL_GET_USERS_FRIEND_REQUESTS = `/api/user/friend-requests/${receiverId}`;

    function reloadFriendReqs() {
        fetch(URL_GET_USERS_FRIEND_REQUESTS)
            .then((response) => response.json())
            .then((data) => setReceivedFriendRequests(data))
            .then(() => setIsLoading(false));
    }

    function acceptFriend(senderId) {
        setIsLoading(true);
        const URL_ACCEPT_FRIEND_REQUEST = `/api/user/friend-accept/${receiverId}/${senderId}`;
        const response = fetch(URL_ACCEPT_FRIEND_REQUEST, {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
            },
        }).then(function (data) {
            console.log(data);
            reloadFriendReqs();
        });

        console.log(response);
    }

    async function rejectFriend(senderId) {
        setIsLoading(true);
        await CancelFriendRequest(receiverId, senderId).then(function (data) {
            console.log(data);
            reloadFriendReqs();
        });
    }

    if (!isLoading) {
        return (
            <span>
                <span
                    className="rec-friend-req-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full"
                    onClick={() => acceptFriend(senderId)}
                >
                    Accept
                </span>

                <span
                    className="rec-friend-req-btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-full"
                    onClick={() => rejectFriend(senderId)}
                >
                    Reject
                </span>
            </span>
        );
    } else {
        return (
            <span key={senderId} className="friend-request-loader-container">
                <span className="friend-request-loader"></span>
            </span>
        );
    }
}
