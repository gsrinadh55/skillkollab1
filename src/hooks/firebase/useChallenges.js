import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

export function useChallenges(creatorId = null) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    let q;
    
    if (creatorId) {
      q = query(
        collection(db, 'challenges'),
        where('creatorId', '==', creatorId)
      );
    } else {
      q = query(
        collection(db, 'challenges'),
        where('status', '==', 'PUBLISHED')
      );
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort descending by createdAt locally since we removed orderBy to avoid index errors
        results.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        setChallenges(results);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to challenges:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [creatorId]);

  return { challenges, loading, error };
}
