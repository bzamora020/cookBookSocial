import React, { useState } from "react";
import './UnfriendButton.css'

export default function UnfriendButton({ currentUserId, profileUid, setFriendedState }){

    const [isLoading, setIsLoading] = useState(false);

    const NOT_FRIENDED = "not friended";

    function unfriend() {
        setIsLoading(true);
        const URL_UNFRIEND = `/api/user/unfriend/${currentUserId}/${profileUid}`;
        const response = fetch(URL_UNFRIEND, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            }
        }).then(function (data) {
            setIsLoading(false);
            setFriendedState(NOT_FRIENDED);
            console.log(data);

        });

        console.log(response);

    }


    return(
        <button className="unfriend-button text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-4 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        onClick={() => unfriend()}
        disabled={isLoading}
        >
            Friended
        {isLoading && (
            <div className="friend-button-loader"> </div>
        )}

        </button>
    )

}