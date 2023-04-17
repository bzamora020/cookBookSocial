import React, { useEffect, useState } from "react";
import CancelFriendRequest from "../cancelFriendRequest/cancelFriendRequest";
import UnfriendButton from "../unfriendButton/UnfriendButton";
import "../friendRequestsDisplay/FriendRequestsDisplay.css";

export default function AddFriendButton({ currentUserId, profileUid, profileInfo }) {
    // Friend states:
    const FRIEND = "friend";
    const UNKNOWN = "unknown";
    const REQUEST_SENT = "request sent";
    const REQUEST_RECEIVED = "request received";
    const NOT_FRIENDED = "not friended";
    const IS_CURRENT_USER = "is current user";
    const [friendedState, setFriendedState] = useState(UNKNOWN);
    const [isButtonLoading, setisButtonLoading] = useState(false);

    useEffect(() => {
        if (profileUid === currentUserId) {
            setFriendedState(IS_CURRENT_USER);
            return;
        }

        if (profileInfo && "friends" in profileInfo) {
            if (currentUserId in profileInfo["friends"]) {
                setFriendedState(FRIEND);
                return;
            }
        }
        if (profileInfo && "receivedFriendRequests" in profileInfo) {
            if (currentUserId in profileInfo["receivedFriendRequests"]) {
                setFriendedState(REQUEST_SENT);
                return;
            }
        }
        if (profileInfo && "sentFriendRequests" in profileInfo) {
            if (currentUserId in profileInfo["sentFriendRequests"]) {
                setFriendedState(REQUEST_RECEIVED);
                return;
            }
        }
        setFriendedState(NOT_FRIENDED);
    }, [
        profileInfo?.friends,
        profileInfo?.receivedFriendRequests,
        profileInfo?.sentFriendRequests,
    ]);

    const URL_SEND_FRIEND_REQUEST = `/api/user/friend-request/${currentUserId}/${profileUid}`;
    function addFriend() {
        setisButtonLoading(true);

        /*
            currentUser.uid is the user id of the current viewer/user.  userId is the id of the user profile that they are viewing.  Need both id's when making a friend request.  currentUser will have the other user id in their 'sentFriendRequests' list in firebase.  The profile being viewed will have the current user ID in their 'receivedFriendRequests' list in firebase.
        */

        fetch(URL_SEND_FRIEND_REQUEST, {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
            },
        }).then(function (data) {
            setisButtonLoading(false);
            if (data.status === 200) {
                setFriendedState(REQUEST_SENT);
            }
        });
    }

    function acceptFriend() {
        setisButtonLoading(true);
        const URL_ACCEPT_FRIEND_REQUEST = `/api/user/friend-accept/${currentUserId}/${profileUid}`;
        fetch(URL_ACCEPT_FRIEND_REQUEST, {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
            },
        }).then(function (data) {
            setisButtonLoading(false);
            if (data.status === 200) {
                setFriendedState(FRIEND);
            }
        });
    }

    function rejectFriend() {
        setisButtonLoading(true);
        CancelFriendRequest(currentUserId, profileUid).then(function (data) {
            setisButtonLoading(false);
            if (data.status === 200) {
                setFriendedState(NOT_FRIENDED);
            }
        });
    }

    function cancelRequest() {
        setisButtonLoading(true);
        CancelFriendRequest(profileUid, currentUserId).then(function (data) {
            setisButtonLoading(false);
            if (data.status === 200) {
                setFriendedState(NOT_FRIENDED);
            }
        });
    }

    if (friendedState === NOT_FRIENDED) {
        return (
            <button
                className="friend-buttons bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={() => addFriend()}
                disabled={isButtonLoading}
            >
                Add Friend
                {isButtonLoading && <div className="friend-button-loader"> </div>}
            </button>
        );
    } else if (friendedState === UNKNOWN) {
        return <span>Loading...</span>;
    } else if (friendedState === REQUEST_RECEIVED) {
        if (!isButtonLoading) {
            return (
                <span>
                    <span
                        className="rec-friend-req-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full"
                        onClick={() => acceptFriend()}
                    >
                        Accept Friend Request
                    </span>
                    <span
                        className="rec-friend-req-btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-full"
                        onClick={() => rejectFriend()}
                    >
                        Reject
                    </span>
                </span>
            );
        } else {
            return <div className="friend-request-loader"> </div>;
        }
    } else if (friendedState === REQUEST_SENT) {
        return (
            <button
                className="friend-buttons rec-friend-cancel-btn text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-2 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                onClick={() => cancelRequest()}
                disabled={isButtonLoading}
            >
                Cancel Friend Request
                {isButtonLoading && <div className="friend-button-loader"> </div>}
            </button>
        );
    } else if (friendedState === FRIEND) {
        return (
            <UnfriendButton
                currentUserId={currentUserId}
                profileUid={profileUid}
                setFriendedState={setFriendedState}
            />
        );
    } else if (friendedState === IS_CURRENT_USER) {
        return <></>;
    }
}
