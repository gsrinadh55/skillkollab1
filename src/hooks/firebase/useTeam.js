import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

export function useTeamMembers(teamId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'teamMembers'),
      where('teamId', '==', teamId),
      where('status', '==', 'ACTIVE')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(results);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to team members:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [teamId]);

  return { members, loading, error };
}

export function useUserTeams(userId) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'teamMembers'),
      where('userId', '==', userId),
      where('status', '==', 'ACTIVE')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Note: this just gets the memberships. In a real app, you might want to join 
        // with the 'teams' collection or store denormalized team info in the membership document.
        setTeams(results);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to user teams:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { teams, loading, error };
}
