import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import ConfirmationModal from "../ConfirmRemoveFriend/Confirmation";

function FriendsListModal({ isOpen, onRequestClose }) {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendName, setFriendName] = useState(null);
  const [isFriendConfirmed, setIsFriendConfirmed] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const auth = getAuth();
  const userID = auth.currentUser.uid;

  const openModal = (friend) => {
    setSelectedFriend(friend);
    setModalIsOpen(true);
    setFriendName(friend.displayName);
  };


  const closeModal = () => {
    setModalIsOpen(false);
  };
  const handleConfirm = (currID, friendID) => {
    console.log(`Confirming friend request from ${friendID} for user ${currID}`);
    setIsFriendConfirmed(true); 
  };
  useEffect(() => {
    const prevBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = isOpen ? 'rgba(0,0,0,0.5)' : 'transparent';
    return () => {
      document.body.style.backgroundColor = prevBackgroundColor;
    };
  }, [isOpen]);
  
  useEffect(() => {
    async function fetchFriends() {
      const db = getFirestore();
      const userDoc = doc(db, 'users', userID);
      const userSnap = await getDoc(userDoc);
      const userData = userSnap.data();
      const userFriends = userData?.friends;
      if (!userFriends) {
        setFriends([]);
        setIsLoading(false);
        return;
      }
      const friendIDs = Object.keys(userFriends);
      const friendDocs = friendIDs.map((friendID) => doc(db, 'users', friendID));
      const friendSnaps = await Promise.all(friendDocs.map(getDoc));
      const friendData = friendSnaps
        .map((friendSnap, index) => {
          const userData = friendSnap.data();
          const profileData = userData?.profile;
          const displayName = typeof profileData === 'object' 
  ? profileData.displayName.length > 25 
    ? profileData.displayName.slice(0, 25) + "..." 
    : profileData.displayName 
  : "NoName";

          return {
            ...profileData,
            displayName,
            id: friendIDs[index]
          };
        })
        .filter(Boolean);
        friendData.sort((friend1, friend2) => {//Prevent them from displaying in dif order every time u click view friends
          if (friend1.displayName < friend2.displayName) return -1;
          if (friend1.displayName > friend2.displayName) return 1;
          return 0;
        });
      setFriends(friendData);
      setIsLoading(false);
    }

    if (isOpen || isFriendConfirmed) { 
      fetchFriends();
      setIsFriendConfirmed(false); 
    }
  }, [isOpen, isFriendConfirmed]); 




 



  return (
    <Modal
  isOpen={isOpen}
  ariaHideApp={false}
  onRequestClose={onRequestClose}
  contentLabel="Friends List"
  style={{
    content: {
      width: '400px',
      height: '400px',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      padding: '0px 16px 10px 16px',
    },
  }}
>
  <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Friends List</h2>
  <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ marginBottom: '2px', width: '100%' }} />
  {isLoading ? (
    <p>Loading friends...</p>
  ) : (
    <>
      {friends.length > 0 ? (
        <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {friends.filter(({ displayName }) => displayName.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(({ displayName, photoURL, id }) =>(
            <li
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f2f2f2',
              }}
            >
              <Link to={`/profile/${id}`} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <img
                  src={photoURL}
                  alt={`${displayName}'s profile picture`}
                  style={{ width: '40px', height: '40px' }}
                />
                <span>{displayName}</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => openModal({ id, displayName })} style={{ backgroundColor: 'lightgrey', borderRadius: '8px', color: 'black', padding: '12px 16px' }}>Unfriend</button>
                {selectedFriend && (
                  <ConfirmationModal
                    currID={userID}
                    friendID={selectedFriend.id}
                    friendName={selectedFriend.displayName}
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    onConfirm={(currID, friendID) => handleConfirm(currID, friendID)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No friends found.</p>
      )}
    </>
  )}
</Modal>
 );
}

export default FriendsListModal;
