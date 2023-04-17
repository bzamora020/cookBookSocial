import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { generateAvatar } from "../../utils/GenerateAvatar";

import styles from "./ProfilePic.module.css";

import { db } from "../../config/firebase";
import { doc,getDoc, setDoc } from "firebase/firestore";

export default function ProfilePic() {
    const navigate = useNavigate();

    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState();
    const [username, setUsername] = useState("");
    const [bio, setBio]=useState();
    const [loading, setLoading] = useState(false);
    const [profileInfo, updateProfileInfo] = useState([]);
    const [charCount, setCharCount] = useState(0);


    const { currentUser, updateUserProfile, setError } = useAuth();

    useEffect(() => {
        const fetchData = () => {
            const res = generateAvatar();
            setAvatars(res);
        };

        fetchData();
    }, []);

    const backClick = () => {
        navigate(-1);
    };

    const picClicked = (index) => {
        setSelectedAvatar(index);
    };

    //get profile info
    useEffect(() => {
        getProfileInfo();
    }, []);
    useEffect(() => {}, [profileInfo]);

    //get user's data from firestore doc identified with their userID
    function getProfileInfo() {
        const userInfoRef = doc(db, "users", currentUser.uid);

        getDoc(userInfoRef)
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    // console.log("invalid user");
                    // window.location.href = "/Invalid";
                }
                const profileInfData = {
                    data: snapshot.data(),
                    id: snapshot.id,
                };
                if (profileInfData.data?.profile){
                    if(profileInfData.data?.profile.biography){
                        
                    setBio
                    (profileInfData.data.profile.biography)
                    }
                }
                updateProfileInfo(profileInfData);
            })
            .catch((error) => console.log(error.message));
    }

    // Function to generate a random tailwind backgroun color
    // Memoized function to generate a random tailwind background color
    const randomColor = useMemo(() => {
        const colors = [
            "bg-red-100",
            "bg-yellow-100",
            "bg-green-100",
            "bg-blue-100",
            "bg-indigo-100",
            "bg-purple-100",
            "bg-pink-100",
        ];

        const result = [];
        while (result.length < 6) {
            const random = Math.floor(Math.random() * colors.length);
            const color = colors[random];
            result.push(color);
        }

        return result;
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (selectedAvatar === undefined) {
            return setError("Please select an avatar");
        }

        try {
            setError("");
            setLoading(true);
            const user = currentUser;
            const profile = {
                displayName: username ? username : currentUser.displayName,
                photoURL: avatars[selectedAvatar],
                biography: bio
            };
            await updateUserProfile(user, profile);
            
            //update user's firestore doc with new profile photo, display name, and bio
            const userRef = doc(db, "users", currentUser.uid);
            setDoc(userRef, { profile: profile }, { merge: true });
            navigate("/home");
        } catch (e) {
            setError("Failed to update profile");
        }

        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 px-4">
            <button
                className="font-medium text-white bg-red-600 hover:bg-red-800 py-2 px-4 rounded rounded-15 flex"
                onClick={backClick}
            >
                Back
            </button>
            <div className="text-left mt-4">
                <h1 className="text-3xl font-bold border-b-2 py-2">Edit Profile</h1>
                <h2 className="mt-4 text-lg font-semibold text-black">Pick an avatar</h2>

                <form className="" onSubmit={handleFormSubmit}>
                    <div className="flex flex-wrap ml-0 p-2">
                        {avatars.map((avatar, index) => (
                            <div key={index}>
                                <div
                                    className={`h-24 w-24 rounded-full ${randomColor[index]} ${
                                        index === selectedAvatar ? "ring" : ""
                                    } p-3 m-2 hover:scale-110 transform transition duration-500 ease-in-out`}
                                >
                                    <img
                                        alt="gallery"
                                        src={avatar}
                                        onClick={() => picClicked(index)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-lg font-semibold text-black py-2">Name</h2>
                    <div className={styles.nameField}>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            className="px-3 py-2 border border-gray-300 "
                            placeholder="Enter a Display Name"
                            defaultValue={currentUser.displayName && currentUser.displayName}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className={styles.bioField}>
    <textarea
        id="bio"
        rows="4"
        name="bio"
        autoComplete="bio"
        required
        className="block  w-full px-3 py-2 border border-gray-300 "
        placeholder="Enter a Bio"
        defaultValue={bio != "" ? bio: "No bio yet"}
        maxLength="150"
        onChange={(e) => {
            setBio(e.target.value);
            setCharCount(e.target.value.length);
        }}
    />
    <div className="text-gray-500 text-right">{charCount}/150</div> 
</div>


                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
