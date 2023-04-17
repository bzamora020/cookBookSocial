import React, { useEffect, useState } from "react";
import FriendRequestControl from "../FriendRequestControl/FriendRequestControl";
import "./FriendRequestsDisplay.css";
import { Link } from "react-router-dom";

export default function FriendRequestsDisplay({ currentUserId }) {
    const [receivedFriendRequests, setReceivedFriendRequests] = useState([]);

    const URL_GET_USERS_FRIEND_REQUESTS = `/api/user/friend-requests/${currentUserId}`;
    useEffect(() => {
        fetch(URL_GET_USERS_FRIEND_REQUESTS)
            .then((response) => response.json())
            .then((data) => setReceivedFriendRequests(data));
    }, []);

    let receivedFriendReqDisplay = [];
    Object.keys(receivedFriendRequests).forEach(function (key) {
        if (receivedFriendRequests[key].profile) {
            receivedFriendReqDisplay.push(
                <tr className="friendRequest" key={receivedFriendRequests[key].uid}>
                    <th>
                        <img
                            src={receivedFriendRequests[key].profile.photoURL || ""}
                            alt="Profile Image"
                            className="friend-image-display"
                        />
                    </th>

                    <th className="friend-names-display">
                        <Link to={`/profile/${key}`}>
                            {receivedFriendRequests[key].profile.displayName ||
                                receivedFriendRequests[key].profile}
                        </Link>
                    </th>
                    <th>
                        <FriendRequestControl
                            senderId={receivedFriendRequests[key].uid}
                            receiverId={currentUserId}
                            setReceivedFriendRequests={setReceivedFriendRequests}
                        />
                    </th>
                </tr>
            );
        }
    });

    if (receivedFriendReqDisplay.length > 0) {
        return (
            <div className="friend-req-display-container">
                <h3>Friend Requests</h3>
                <div className="rec-friend-req-container">
                    <table>{receivedFriendRequests.length !== 0 && receivedFriendReqDisplay}</table>
                </div>
            </div>
        );
    } else {
        return <></>;
    }
}
