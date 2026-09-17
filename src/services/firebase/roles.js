import { collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const ROLES_COLLECTION = 'challenge_roles';

export const rolesService = {
  /**
   * Create a new role for a challenge
   */
  async createRole(data) {
    if (!data.challenge_id) throw new Error("challenge_id is required");
    
    const docRef = await addDoc(collection(db, ROLES_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  /**
   * Get all open roles for a specific challenge
   */
  async getOpenRolesForChallenge(challengeId) {
    const q = query(
      collection(db, ROLES_COLLECTION),
      where("challenge_id", "==", challengeId),
      where("status", "==", "OPEN")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get all roles for a specific challenge
   */
  async getRolesForChallenge(challengeId) {
    const q = query(
      collection(db, ROLES_COLLECTION),
      where("challenge_id", "==", challengeId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Update role
   */
  async updateRole(roleId, data) {
    const docRef = doc(db, ROLES_COLLECTION, roleId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  },
  
  /**
   * Increment filled slots
   */
  async incrementFilledSlots(roleId) {
    const docRef = doc(db, ROLES_COLLECTION, roleId);
    const snap = await getDoc(docRef);
    if(snap.exists()) {
      const data = snap.data();
      const newFilled = (data.filledSlots || 0) + 1;
      const newStatus = newFilled >= (data.slots || 1) ? 'CLOSED' : 'OPEN';
      await updateDoc(docRef, {
        filledSlots: newFilled,
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    }
  }
};
