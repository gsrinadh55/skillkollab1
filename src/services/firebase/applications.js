import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const APPLICATIONS_COLLECTION = 'applications';

export const applicationsService = {
  /**
   * Submit a new application
   */
  async submitApplication(data) {
    // Security verification: Ensure the applicant is not the challenge creator
    if (!data.challengeId || !data.studentId) {
      throw new Error("Missing required application data.");
    }
    
    const challengeRef = doc(db, 'challenges', data.challengeId);
    const challengeSnap = await getDoc(challengeRef);
    if (challengeSnap.exists()) {
      const challengeData = challengeSnap.data();
      if (
        data.studentId === challengeData.creatorId ||
        data.studentId === challengeData.ownerId ||
        data.studentId === challengeData.leadId
      ) {
        throw new Error("Security Violation: Challenge owners cannot apply to their own challenges.");
      }
    }

    // Security verification: Ensure the applicant has not already applied
    const duplicateQuery = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("challengeId", "==", data.challengeId),
      where("studentId", "==", data.studentId)
    );
    const duplicateSnap = await getDocs(duplicateQuery);
    if (!duplicateSnap.empty) {
      throw new Error("Application already submitted for this challenge.");
    }

    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...data,
      status: 'PENDING',
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  /**
   * Update application status (Accept / Reject)
   */
  async updateApplicationStatus(applicationId, status, reviewedBy) {
    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await updateDoc(docRef, {
      status,
      reviewedBy,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  },

  /**
   * Get applications for a specific challenge
   */
  async getApplicationsForChallenge(challengeId) {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION), 
      where("challengeId", "==", challengeId),
      orderBy("submittedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get all applications submitted by a specific student
   */
  async getApplicationsByStudent(studentId) {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION), 
      where("studentId", "==", studentId),
      orderBy("submittedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get applications for a set of challenges (useful for Innovation Lead dashboard)
   */
  async getApplicationsForChallenges(challengeIds) {
    if (!challengeIds || challengeIds.length === 0) return [];
    
    // Firestore 'in' queries are limited to 10 items. For a real production app with many challenges,
    // you'd typically query all applications where the challenge creator is the current user.
    // Assuming the application document also stores `challengeCreatorId` for easier querying.
    const q = query(
      collection(db, APPLICATIONS_COLLECTION), 
      where("challengeId", "in", challengeIds.slice(0, 10))
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Get applications by challenge creator ID (Better scalable approach)
   */
  async getApplicationsByCreator(creatorId) {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION), 
      where("challengeCreatorId", "==", creatorId),
      orderBy("submittedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
