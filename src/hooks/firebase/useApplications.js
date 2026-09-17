import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

export function useApplications(filter = {}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    let q;
    
    // We can filter by challengeCreatorId (for Leads) or studentId (for Contributors)
    if (filter?.challengeCreatorId) {
      q = query(
        collection(db, 'applications'),
        where('challengeCreatorId', '==', filter.challengeCreatorId)
      );
    } else if (filter?.studentId) {
      q = query(
        collection(db, 'applications'),
        where('studentId', '==', filter.studentId)
      );
    } else if (filter?.challengeId) {
      q = query(
        collection(db, 'applications'),
        where('challengeId', '==', filter.challengeId)
      );
    } else {
      setLoading(false);
      return; // No valid query params
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => {
          const timeA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : 0;
          const timeB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : 0;
          return timeB - timeA;
        });
        setApplications(results);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to applications:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filter.challengeCreatorId, filter.studentId, filter.challengeId]);

  return { applications, loading, error };
}
