import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

export const usersService = {
  /**
   * Fetch a user profile by UID
   */
  async getUserProfile(uid) {
    if (!uid) throw new Error('User ID is required');
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update a user profile
   */
  async updateUserProfile(uid, data) {
    if (!uid) throw new Error('User ID is required');
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Get users by roles (array of roles)
   */
  async getUsersByRoles(roles) {
    if (!roles || roles.length === 0) return [];
    try {
      const q = query(
        collection(db, 'users'),
        where('role', 'in', roles)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users by roles:', error);
      throw error;
    }
  },

  /**
   * Get all users
   */
  async getAllUsers() {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }
};
