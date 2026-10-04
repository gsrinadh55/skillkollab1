import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { challengesService } from '../../services/firebase/challenges';

export function useChallenges(creatorId = null) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchChallenges = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let apiResults = [];
        try {
          const url = creatorId ? `/projects?ownerId=${creatorId}` : `/projects`;
          const response = await api.get(url);
          apiResults = response.data?.data || response.data || [];
          if (!Array.isArray(apiResults)) apiResults = [];
        } catch (apiErr) {
          console.warn("API projects fetch error:", apiErr);
        }

        let fbResults = [];
        try {
          if (creatorId) {
            fbResults = await challengesService.getChallengesByCreator(creatorId);
          } else {
            fbResults = await challengesService.getPublishedChallenges();
          }
          if (!Array.isArray(fbResults)) fbResults = [];
        } catch (fbErr) {
          console.warn("Firebase challenges fetch error:", fbErr);
        }

        if (isMounted) {
          const combinedMap = new Map();

          fbResults.forEach(item => {
            if (item && item.id) {
              combinedMap.set(item.id, item);
            }
          });

          apiResults.forEach(item => {
            if (item && item.id) {
              if (!combinedMap.has(item.id)) {
                combinedMap.set(item.id, item);
              }
            }
          });

          let all = Array.from(combinedMap.values());

          if (creatorId) {
            const userOwned = all.filter(c => 
              c.ownerId === creatorId || 
              c.creatorId === creatorId || 
              c.leadId === creatorId
            );
            setChallenges(userOwned.length > 0 ? userOwned : all);
          } else {
            const publicOnly = all.filter(ch => ch.status === 'PUBLISHED' || ch.status === 'ACTIVE' || !ch.status);
            setChallenges(publicOnly);
          }

          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching challenges:", err);
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchChallenges();

    return () => {
      isMounted = false;
    };
  }, [creatorId]);

  return { challenges, loading, error };
}
