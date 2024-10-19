import { createSlice } from '@reduxjs/toolkit';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeFirebase } from "./lib/firebaseClient";
import { getFirebaseFirestore } from './lib/firebaseClient';
import { doc, getDoc, updateDoc } from "firebase/firestore";

const initialState = {
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { uid, email, displayName } = action.payload;
      state.user = { uid, email, displayName };
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
  },
});

export const fetchUserData = (userId) => async (dispatch) => {
  if (userId) {
    const db = getFirebaseFirestore();
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      console.log('User data:', userSnapshot.data());
      dispatch(setUsername(userSnapshot.data().displayName)); 
    } else {
      console.log('No such document!');
    }
  } else {
    console.error('No user ID provided!');
  }
};

const updateUserStatus = async (uid, status) => {
  try{
      const userRef = doc(getFirebaseFirestore(), "users", uid);
      await updateDoc(userRef, {
      status: status,
      });
  } catch (error) {
      console.error('Error updating user status:', error);
  }
}

// Thunk to handle Firebase authentication state change
export const monitorAuthState = () => (dispatch) => {
  initializeFirebase();
  const auth = getAuth();

  dispatch(setLoading(true));

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if(user) {
      const { uid, email, displayName } = user;
      dispatch(setUser({ uid, email, displayName }));
      updateUserStatus(uid, 'online');
    } else if (!user && !dispatch(logoutUser())) {
      alert("You are not logged in! Please log in.");
    }else {
      dispatch(clearUser());
    }
    dispatch(setLoading(false));
  });

  return unsubscribe;
};

export const logoutUser = () => async (dispatch, getState) => {
  const auth = getAuth();
  const user = getState().auth.user;
  console.log('User during logout:', user);

  try{
    if (user) {
      await updateUserStatus(user.uid, 'offline');
    }
    await signOut(auth);
    dispatch(clearUser());
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

export const { setUser, clearUser, setLoading, setUsername } = authSlice.actions;
export default authSlice.reducer;
