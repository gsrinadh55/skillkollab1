import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const TEAMS_COLLECTION = 'teams';
const TEAM_MEMBERS_COLLECTION = 'teamMembers';

export const teamsService = {
  /**
   * Create a new team (usually happens automatically when a challenge is published, or when the first member is accepted)
   */
  async createTeam(challengeId, leadId, name) {
    const docRef = await addDoc(collection(db, TEAMS_COLLECTION), {
      challengeId,
      leadId,
      name,
      status: 'FORMING',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  /**
   * Get team by challenge ID
   */
  async getTeamByChallengeId(challengeId) {
    const q = query(collection(db, TEAMS_COLLECTION), where("challengeId", "==", challengeId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  /**
   * Add a member to a team (happens when application is accepted)
   */
  async addTeamMember(teamId, challengeId, userId, role) {
    const docRef = await addDoc(collection(db, TEAM_MEMBERS_COLLECTION), {
      teamId,
      challengeId,
      userId,
      role,
      status: 'ACTIVE',
      joinedAt: serverTimestamp()
    });
    return docRef.id;
  },

  /**
   * Get all members for a specific team
   */
  async getTeamMembers(teamId) {
    const q = query(
      collection(db, TEAM_MEMBERS_COLLECTION), 
      where("teamId", "==", teamId),
      where("status", "==", "ACTIVE")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get all teams a user belongs to
   */
  async getUserTeams(userId) {
    const q = query(
      collection(db, TEAM_MEMBERS_COLLECTION), 
      where("userId", "==", userId),
      where("status", "==", "ACTIVE")
    );
    const querySnapshot = await getDocs(q);
    
    // Fetch the actual team details for each membership
    const teamPromises = querySnapshot.docs.map(async (membershipDoc) => {
      const membership = membershipDoc.data();
      const teamDoc = await getDoc(doc(db, TEAMS_COLLECTION, membership.teamId));
      return {
        membershipId: membershipDoc.id,
        ...membership,
        team: teamDoc.exists() ? { id: teamDoc.id, ...teamDoc.data() } : null
      };
    });
    
    return Promise.all(teamPromises);
  }
};
