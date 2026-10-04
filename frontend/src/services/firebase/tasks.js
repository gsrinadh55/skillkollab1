import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export const tasksService = {
  // Create a new task
  createTask: async (projectId, taskData) => {
    try {
      const taskRef = doc(db, 'workspaceTasks', taskData.id);
      await setDoc(taskRef, {
        projectId,
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: taskData.id, ...taskData };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Get all tasks for a project
  getProjectTasks: async (projectId) => {
    try {
      const q = query(
        collection(db, 'workspaceTasks'),
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  // Update task status (column)
  updateTaskColumn: async (taskId, column) => {
    try {
      const taskRef = doc(db, 'workspaceTasks', taskId);
      await updateDoc(taskRef, {
        column,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating task column:', error);
      throw error;
    }
  }
};
