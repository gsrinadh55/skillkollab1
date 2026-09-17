import { createSlice } from '@reduxjs/toolkit';

const INITIAL_WORKSPACE_DATA = {};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    workspaces: {},
    activeWorkspaceId: null,
    kanbanTasks: [],
    chatMessages: [],
    sharedDocuments: [],
    githubCommits: [],
    activeTeamMembers: []
  },
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload;
    },
    setWorkspaceTab: (state, action) => {
      const { challengeId, tab } = action.payload;
      const ws = state.workspaces[challengeId];
      if (ws) ws.activeTab = tab;
    },
    sendChatMessage: (state, action) => {
      const newMsg = {
        id: `msg-${Date.now()}`,
        user: action.payload.user || 'User',
        sender: action.payload.user || 'User',
        avatar: action.payload.avatar || '',
        role: 'Team Member',
        text: action.payload.text || action.payload,
        timestamp: action.payload.timestamp || new Date().toLocaleTimeString()
      };
      state.chatMessages.push(newMsg);
      const ws = state.workspaces[state.activeWorkspaceId];
      if (ws && ws.chatMessages) ws.chatMessages.push(newMsg);
    },
    moveKanbanTask: (state, action) => {
      const { taskId, column, targetColumn } = action.payload;
      const dest = column || targetColumn;
      const t = state.kanbanTasks.find(x => x.id === taskId);
      if (t) t.column = dest;
      const ws = state.workspaces[state.activeWorkspaceId];
      if (ws && ws.tasks) {
        const wt = ws.tasks.find(x => x.id === taskId);
        if (wt) wt.column = dest;
      }
    },
    addKanbanTask: (state, action) => {
      const newTask = {
        id: `t-${Date.now()}`,
        title: action.payload.title || action.payload,
        assignee: action.payload.assignee || 'Unassigned',
        priority: action.payload.priority || 'Medium',
        tag: 'Sprint Task',
        column: action.payload.column || 'todo',
        hoursEstimated: 8
      };
      state.kanbanTasks.unshift(newTask);
      const ws = state.workspaces[state.activeWorkspaceId];
      if (ws && ws.tasks) ws.tasks.unshift(newTask);
    },
    addWorkspaceDocument: (state, action) => {
      const newDoc = {
        id: `f-${Date.now()}`,
        name: action.payload.name || 'New_Architecture_Spec.pdf',
        size: action.payload.size || '2.5 MB',
        type: 'Specification PDF',
        uploadedBy: action.payload.uploadedBy || 'User',
        date: action.payload.date || new Date().toLocaleString()
      };
      state.sharedDocuments.unshift(newDoc);
      const ws = state.workspaces[state.activeWorkspaceId];
      if (ws && ws.files) ws.files.unshift(newDoc);
    },
    updateSharedNotes: (state, action) => {
      const { challengeId, content } = action.payload;
      const ws = state.workspaces[challengeId];
      if (ws) ws.sharedNotes = content;
    }
  }
});

export const { 
  setActiveWorkspace, 
  setWorkspaceTab, 
  sendChatMessage, 
  moveKanbanTask, 
  addKanbanTask, 
  addWorkspaceDocument, 
  updateSharedNotes 
} = workspaceSlice.actions;

export const sendMessage = sendChatMessage;
export const moveTask = moveKanbanTask;
export const addTask = addKanbanTask;
export const addDocument = addWorkspaceDocument;

export default workspaceSlice.reducer;
