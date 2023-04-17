import { db } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";

async function getUser(userId) {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
        return undefined;
    }
    return docSnap.data();
}

export { getUser };
