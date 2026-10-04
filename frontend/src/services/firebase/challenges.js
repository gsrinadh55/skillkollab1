import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

import { rolesService } from './roles';

const CHALLENGES_COLLECTION = 'challenges';

export const challengesService = {
  /**
   * Create a new challenge
   */
  async createChallenge(data) {
    // Extract roles from data to avoid duplicating them in the challenge document
    const { roles, ...challengeData } = data;
    
    const docRef = await addDoc(collection(db, CHALLENGES_COLLECTION), {
      ...challengeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const challengeId = docRef.id;
    
    // Save roles to challenge_roles collection
    if (roles && Array.isArray(roles)) {
      for (const role of roles) {
        await rolesService.createRole({
          ...role,
          challenge_id: challengeId,
          slots: role.count || 1,
          available_slots: role.count || 1,
          filledSlots: 0,
          status: 'OPEN',
          role_name: role.name,
          required_skills: role.skills || []
        });
      }
    }
    
    return challengeId;
  },

  /**
   * Update an existing challenge
   */
  async updateChallenge(challengeId, data) {
    const docRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  },

  /**
   * Delete a challenge
   */
  async deleteChallenge(challengeId) {
    const docRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    await deleteDoc(docRef);
    return true;
  },

  /**
   * Get all published challenges (Marketplace)
   */
  async getPublishedChallenges() {
    const q = query(
      collection(db, CHALLENGES_COLLECTION), 
      where("status", "==", "PUBLISHED")
    );
    const querySnapshot = await getDocs(q);
    let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    results.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    return results;
  },

  /**
   * Get challenges by creator UID
   */
  async getChallengesByCreator(creatorId) {
    const q = query(
      collection(db, CHALLENGES_COLLECTION), 
      where("creatorId", "==", creatorId)
    );
    const querySnapshot = await getDocs(q);
    let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    results.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    return results;
  },

  /**
   * Get a single challenge
   */
  async getChallengeById(challengeId) {
    const docRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }
};
