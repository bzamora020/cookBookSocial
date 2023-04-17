import { db } from "../firebase.js";
import { setDoc, doc, collection, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";

const addUser = async (req, res, next) => {
    try {
        const uid = req.params.id;
        const data = req.body;
        data["createdAt"] = serverTimestamp();
        await setDoc(doc(db, "users", uid), data);
        res.status(200).send(`User added with with uid: ${uid}`);
    } catch (e) {
        res.status(400).send(`Error: ${e.message}`);
        console.error(e);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const uid = req.params.id;
        const docRef = doc(db, "users", id);
        await deleteDoc(docRef);
        res.status(200).send(`User deleted with ID: ${docRef.id}`);
    } catch (e) {
        res.status(400).send(`Error: ${e.message}`);
    }
};

const getFriendRequests = async(req, res, next) => {
    try{
        const id = req.params.id;
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);


        if (docSnap.exists()) {
            const docSnapData = docSnap.data();
            if("receivedFriendRequests" in docSnapData){
                res.status(200).send(JSON.stringify(docSnapData['receivedFriendRequests']));
            } else {
                res.status(200).send(JSON.stringify({'receivedFriendRequests': []}));
            }
        } else {
            // doc.data() will be undefined in this case
            res.status(400).send("Document not found");
        }
    } catch(e){
        res.status(400).send(e);
    }
}

const sendFriendRequest = async (req, res, next) => {
    /*
    idSent is the user id of the current viewer/user that sent the friend request (the sender).  idReceived is the id of the user that they sent a friend request to.  Need both id's when making a friend request.  The sender will have the other user id in their 'sentFriendRequests' list in firebase.  The receiver will have the current user ID in their 'receivedFriendRequests' list in firebase.
*/

    try{

        const idSentFrom = req.params['idSent'];
        const idSentTo = req.params['idReceived'];

        
        if(!idSentFrom || !idSentTo){
            throw new Error("Got invalid parameters.");
        }


        if(idSentFrom === idSentTo){
            throw new Error("Cannot friend yourself!");
        }

    

        const docRefSent = doc(db, "users", idSentFrom);
        const docRefReceived = doc(db, "users", idSentTo);

        const docSnapSend = await getDoc(docRefSent);
        const docSnapRec = await getDoc(docRefReceived);

        if(!docSnapSend.exists() || !docSnapRec.exists() ){
            throw new Error("One of these users does not exist!");
        }

        const updateDataSend = docSnapSend.data();
        const updateDataRec = docSnapRec.data();



        if("friends" in updateDataSend){
            if (idSentTo in updateDataSend['friends']) {
                throw new Error("Already friended");

            } 
        }

        if ("friends" in updateDataRec) {
            if (idSentFrom in updateDataRec['friends']) {
                throw new Error("Already friended (This shouldn't happen)");

            }
        }

        let recProfile = {};
        if('profile' in updateDataRec){
            recProfile = updateDataRec['profile'];
        } else {
            recProfile = updateDataRec['email'];
        }
        let sendProfile = {};
        if ('profile' in updateDataSend) {
            sendProfile = updateDataSend['profile'];
        } else {
            sendProfile = updateDataSend['email'];
        }

        const infoForSender = {
            profile: recProfile,
            uid: idSentTo
   
        }

        const infoForRec = {
            profile: sendProfile,
            uid: idSentFrom
            
        }

        if ("receivedFriendRequests" in updateDataSend) {
            if (idSentTo in updateDataSend['receivedFriendRequests']) {
                throw new Error(" WARNING: You already received a friend request from them.");
            } 
        } 


        if("sentFriendRequests" in updateDataSend){
            if(idSentTo in updateDataSend['sentFriendRequests']){
                throw new Error("Already sent friend request to them.");

            } else {
                updateDataSend['sentFriendRequests'][`${idSentTo}`] = infoForSender;
            }
        } else {
            updateDataSend['sentFriendRequests'] = {};
            updateDataSend['sentFriendRequests'][`${idSentTo}`] = infoForSender;

        }


        if("receivedFriendRequests" in updateDataRec){
            if (idSentFrom in updateDataRec['receivedFriendRequests']){
                throw new Error(" WARNING: They have already received your friend request.  THIS SHOULD NOT HAPPEN");
            } else {
                updateDataRec['receivedFriendRequests'][`${idSentFrom}`] =  infoForRec;
            }
        } else {
            updateDataRec['receivedFriendRequests'] = {};
            updateDataRec['receivedFriendRequests'][`${idSentFrom}`] = infoForRec;
        }

        let count = 0;
        if('notifications' in updateDataRec){
            if('count' in updateDataRec['notifications']){
                count = updateDataRec['notifications']['count'];
            }
        } else {
            updateDataRec['notifications'] = {};
        }

        updateDataRec['notifications']['count'] = count + 1;

        if ('friends' in updateDataRec['notifications']) {
            if (!(updateDataRec['notifications']['friends'].includes(idSentFrom))) {
                updateDataRec['notifications']['friends'].push(idSentFrom);
            }
        } else {
            updateDataRec['notifications']['friends'] = [];
            updateDataRec['notifications']['friends'].push(idSentFrom);
        }


        await updateDoc(docRefSent, updateDataSend);
        await updateDoc(docRefReceived, updateDataRec);
        // console.log(updateDataRec);
        // console.log(updateDataSend);


        res.status(200).send(`Success.  Friend Request Sent.`);




    } catch(e){
        res.status(400).send(`Error: ${e}`);
        // console.log(e);
        return;
    }
}

const resetNotifications = async (req, res, next) => {
    try{

        const id = req.params['id'];

        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if(!docSnap.exists()){
            throw new Error("User does not exist!");
        }

        const updateData = docSnap.data();

        if('notifications' in updateData){
            updateData['notifications']['count'] = 0;
            updateData['notifications']['friends'] = [];
            await updateDoc(docRef, updateData);
        }
        res.status(200).send(`Success.  Notifications reset.`);


    } catch(e){
        res.status(400).send(`Error: ${e}`);
        return;
    }
}

const getNotifications = async (req, res, next) => {
    try{
        const id = req.params.id;
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);


        if (docSnap.exists()) {
            const docSnapData = docSnap.data();
            if("notifications" in docSnapData){
                res.status(200).send(JSON.stringify({'notifications' : docSnapData['notifications']}));
            } else {
                res.status(200).send(JSON.stringify({'notifications': {
                    'count': 0
                }}));
            }
        } else {
            // doc.data() will be undefined in this case
            res.status(400).send("Document not found");
        }
    } catch(e){
        res.status(400).send(e);
    }

}

const acceptFriendRequest = async (req, res, next) => {
    /*
        idReceiver is the current user that is accepting a friend request.  The idSender is the one who sent the friend request.  They will both be added to eachother's friends list, and removed from 'sendFriendRequests' and 'receivedFriendRequest' lists
    */

    try {
        const idReceiver = req.params['idReceived'];
        const idSender = req.params['idSent'];

        if (!idReceiver || !idSender) {
            throw new Error("Got invalid parameters.");
        }


        if (idReceiver === idSender) {
            throw new Error("Cannot friend yourself!");
        }

        const docRefSender = doc(db, "users", idSender);
        const docRefReceiver = doc(db, "users", idReceiver);

        const docSnapSender = await getDoc(docRefSender);
        const docSnapReceiver = await getDoc(docRefReceiver);

        if (!docSnapSender.exists() || !docSnapReceiver.exists()) {
            throw new Error("One of these users does not exist!");
        }

        const updateDataSend = docSnapSender.data();
        const updateDataRec = docSnapReceiver.data();


        if ("sentFriendRequests" in updateDataSend) {

            if (idReceiver in updateDataSend['sentFriendRequests']) {
                delete updateDataSend['sentFriendRequests'][idReceiver];
            } else {
                throw new Error("Friend Request was Canceled");
            }

        } else {
            throw new Error("Friend Request was Canceled");
        }

        if ("receivedFriendRequests" in updateDataRec) {


            if (idSender in updateDataRec['receivedFriendRequests']) {
                delete updateDataRec['receivedFriendRequests'][idSender];
            } else {
                throw new Error("Friend Request was Canceled");
            }


        } else {
            throw new Error("Friend Request was Canceled");
        }


        let recProfile = {};
        if ('profile' in updateDataRec) {
            recProfile = updateDataRec['profile'];
        } else {
            recProfile = updateDataRec['email'];
        }
        let sendProfile = {};
        if ('profile' in updateDataSend) {
            sendProfile = updateDataSend['profile'];
        } else {
            sendProfile = updateDataSend['email'];
        }

        let notifCount = 0;
        if('notifications' in updateDataSend){
            if('count' in updateDataSend['notifications']){
                notifCount = updateDataSend['notifications']['count'];
            }
        } else {
            updateDataSend['notifications'] = {};
        }

        updateDataSend['notifications']['count'] = notifCount + 1;


        const infoForSender = {
            uid: idReceiver,
            profile: recProfile
        }

        const infoForRec = {
            uid: idSender,
            profile: sendProfile
        }

        if ("friends" in updateDataSend) {
            if (idReceiver in updateDataSend['friends']) {
                throw new Error("Already friended");
            } else {
                updateDataSend['friends'][idReceiver] = infoForSender;
            }
        } else {
            updateDataSend['friends'] = {};
            updateDataSend['friends'][idReceiver] = infoForSender;
        }

        if('friends' in updateDataSend['notifications']){
            updateDataSend['notifications']['friends'].push(idReceiver);
        } else {
            updateDataSend['notifications']['friends'] = [];
            updateDataSend['notifications']['friends'].push(idReceiver);
        }

        if ("friends" in updateDataRec) {
            if (idSender in updateDataRec['friends']) {
                throw new Error("Already friended (This shouldn't happen)");

            }else {
                updateDataRec['friends'][idSender] = infoForRec;
            }
        } else {
            updateDataRec['friends'] = {};
            updateDataRec['friends'][idSender] = infoForRec;
        }





        await updateDoc(docRefSender, updateDataSend);
        await updateDoc(docRefReceiver, updateDataRec);

        res.status(200).send(`Success.  Friended.`);


    } catch(e){
        res.status(400).send(`Error: ${e}`);
        console.log(e);
        return;
    }
}


const rejectFriendRequest = async (req, res, next) => {
    /*
        idReceiver is the current user that is accepting a friend request.  The idSender is the one who sent the friend request.  They will both be added to eachother's friends list, and removed from 'sendFriendRequests' and 'receivedFriendRequest' lists

        This is also used for cancelling a friend request
    */

    try {
        const idReceiver = req.params['idReceived'];
        const idSender = req.params['idSent'];

        if (!idReceiver || !idSender) {
            throw new Error("Got invalid parameters.");
        }

        const docRefSender = doc(db, "users", idSender);
        const docRefReceiver = doc(db, "users", idReceiver);

        const docSnapSender = await getDoc(docRefSender);
        const docSnapReceiver = await getDoc(docRefReceiver);

        if (!docSnapSender.exists() || !docSnapReceiver.exists()) {
            throw new Error("One of these users does not exist!");
        }

        const updateDataSend = docSnapSender.data();
        const updateDataRec = docSnapReceiver.data();


        if ("sentFriendRequests" in updateDataSend) {

            if (idReceiver in updateDataSend['sentFriendRequests']){
                delete updateDataSend['sentFriendRequests'][idReceiver];
            } else {
                throw new Error("Friend Request was Canceled");
            }




        } else {
            throw new Error("Friend Request was Canceled");
        }

        if ("receivedFriendRequests" in updateDataRec) {


            if (idSender in updateDataRec['receivedFriendRequests']) {
                delete updateDataRec['receivedFriendRequests'][idSender];
            } else {
                throw new Error("Friend Request was Canceled");
            }


        } else {
            throw new Error("Friend Request was Canceled");
        }

        if('notifications' in updateDataRec){

            if('friends' in updateDataRec['notifications']){

                if((updateDataRec['notifications']['friends'].includes(idSender))){

                    updateDataRec['notifications']['friends'] = updateDataRec['notifications']['friends'].filter(i => i !== idSender);
                    if(updateDataRec['notifications']['count'] > 0){
                        updateDataRec['notifications']['count']--;
                    }
                }
            } 
        }


    


        await updateDoc(docRefSender, updateDataSend);
        await updateDoc(docRefReceiver, updateDataRec);

        res.status(200).send(`Success.  Rejected Friend Request.`);


    } catch (e) {
        res.status(400).send(`Error: ${e}`);
        console.log(e);
        return;
    }
}



const unfriend = async (req, res, next) => {
    /*
        idReceiver is the current user that is accepting a friend request.  The idSender is the one who sent the friend request.  They will both be added to eachother's friends list, and removed from 'sendFriendRequests' and 'receivedFriendRequest' lists
    */

    try {
        const idReceiver = req.params['idReceived'];
        const idSender = req.params['idSent'];

        if (!idReceiver || !idSender) {
            throw new Error("Got invalid parameters.");
        }


        if (idReceiver === idSender) {
            throw new Error("Cannot unfriend yourself!");
        }

        const docRefSender = doc(db, "users", idSender);
        const docRefReceiver = doc(db, "users", idReceiver);

        const docSnapSender = await getDoc(docRefSender);
        const docSnapReceiver = await getDoc(docRefReceiver);

        if (!docSnapSender.exists() || !docSnapReceiver.exists()) {
            throw new Error("One of these users does not exist!");
        }

        const updateDataSend = docSnapSender.data();
        const updateDataRec = docSnapReceiver.data();

        if ("friends" in updateDataSend) {
            if (idReceiver in updateDataSend['friends']) {
                delete updateDataSend['friends'][idReceiver];
            } 
        } 


        if ("friends" in updateDataRec) {
            if (idSender in updateDataRec['friends']) {
                delete updateDataRec['friends'][idSender];
            }
        } 


        await updateDoc(docRefSender, updateDataSend);
        await updateDoc(docRefReceiver, updateDataRec);

        res.status(200).send(`Success.  Unfriended.`);


    } catch(e){
        res.status(400).send(`Error: ${e}`);
        console.log(e);
        return;
    }
}

const getFriendsList = async (req, res, next) =>{
    try {
        const uid = req.params['uid'];
        const docRef = await doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        let docSnapData = docSnap.data();        
        if ( docSnapData != null) {
            let friendsList =[]; //id array
            if('friends' in docSnapData){
                friendsList = docSnapData['friends']
            }
            res.status(200).send(friendsList);
        } else {
            res.status(400).send("Document not found");
        }
    }catch(e){
        res.status(400).send(e);
    }
}

export { addUser, deleteUser, sendFriendRequest, acceptFriendRequest, getFriendRequests, rejectFriendRequest, unfriend,getFriendsList, resetNotifications, getNotifications };
