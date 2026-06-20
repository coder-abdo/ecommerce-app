import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  name: string | null;
  role: string | null;
  isAuthenticated: boolean;
  authMethod: 'Google' | 'Password' | null;
}

const initialState: AuthState = {
  name: null,
  role: null,
  isAuthenticated: false,
  authMethod: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        name: string;
        role: string;
        authMethod: 'Google' | 'Password';
      }>
    ) => {
      const { name, role, authMethod } = action.payload;
      state.name = name;
      state.role = role;
      state.isAuthenticated = true;
      state.authMethod = authMethod;
    },
    clearCredentials: (state) => {
      state.name = null;
      state.role = null;
      state.isAuthenticated = false;
      state.authMethod = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
