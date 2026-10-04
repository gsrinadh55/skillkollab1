import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchConnectionStatus = createAsyncThunk(
  'connections/fetchStatus',
  async (targetUserId) => {
    const response = await api.get(`/connections/status/${targetUserId}`);
    return { targetUserId, ...response.data.data };
  }
);

export const sendConnectionRequest = createAsyncThunk(
  'connections/sendRequest',
  async (targetUserId) => {
    const response = await api.post('/connections/request', { receiverId: targetUserId });
    return { targetUserId, connection: response.data.data };
  }
);

export const fetchAllConnections = createAsyncThunk(
  'connections/fetchAll',
  async () => {
    const [sentRes, receivedRes, connectedRes] = await Promise.all([
      api.get('/connections/sent'),
      api.get('/connections/requests'),
      api.get('/connections')
    ]);
    
    return {
      sent: sentRes.data.data,
      received: receivedRes.data.data,
      connected: connectedRes.data.data
    };
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  'connections/accept',
  async (connectionId) => {
    const response = await api.post(`/connections/${connectionId}/accept`);
    return response.data.data;
  }
);

export const declineConnectionRequest = createAsyncThunk(
  'connections/decline',
  async (connectionId) => {
    const response = await api.post(`/connections/${connectionId}/decline`);
    return response.data.data;
  }
);

const initialState = {
  statuses: {}, // Mapping targetUserId -> { status: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'DECLINED', connectionId: null }
  sentRequests: [],
  receivedRequests: [],
  activeConnections: [],
  loading: false,
};

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    // Allows updating state from Socket events
    receiveConnectionUpdate(state, action) {
      const conn = action.payload;
      const otherUserId = conn.requesterId; // simplify based on the flow
      
      // We need to re-fetch all to keep it clean, but for immediate UI:
      // This is a basic optimisitic patch. Usually we'd re-dispatch fetchAllConnections
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnectionStatus.fulfilled, (state, action) => {
        const { targetUserId, status, id } = action.payload;
        state.statuses[targetUserId] = { status, connectionId: id };
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        const { targetUserId, connection } = action.payload;
        state.statuses[targetUserId] = { status: 'PENDING_SENT', connectionId: connection.id };
        state.sentRequests.push(connection);
      })
      .addCase(fetchAllConnections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.sentRequests = action.payload.sent;
        state.receivedRequests = action.payload.received;
        state.activeConnections = action.payload.connected;
      })
      .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
        const conn = action.payload;
        state.receivedRequests = state.receivedRequests.filter(c => c.id !== conn.id);
        state.activeConnections.push(conn);
        // Also update status map if it exists
        if (state.statuses[conn.requesterId]) {
          state.statuses[conn.requesterId].status = 'ACCEPTED';
        }
      })
      .addCase(declineConnectionRequest.fulfilled, (state, action) => {
        const conn = action.payload;
        state.receivedRequests = state.receivedRequests.filter(c => c.id !== conn.id);
        if (state.statuses[conn.requesterId]) {
          state.statuses[conn.requesterId].status = 'DECLINED';
        }
      });
  }
});

export const { receiveConnectionUpdate } = connectionsSlice.actions;
export default connectionsSlice.reducer;
