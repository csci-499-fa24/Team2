import { createSlice } from '@reduxjs/toolkit';
import { getAuth, onAuthStateChanged, signOut, updateEmail } from "firebase/auth";
import { initializeFirebase } from "../lib/firebaseClient";
import { getFirebaseFirestore } from '../lib/firebaseClient';
import { doc, setDoc, getDoc, getDocs, updateDoc, query, where, collection } from "firebase/firestore";

const initialState = {
  user: null,
  loading: true,
  activeUsers: [],
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
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDisplayName: (state, action) => {
      state.user.displayName = action.payload;
      state.loading = false;
    },
    setActiveUsers: (state, action) => {
      state.activeUsers = [...action.payload];
      state.loading = false;
    },
    addActiveUser: (state, action) => {
      if(!state.activeUsers.includes(action.payload)) {
        state.activeUsers.push(action.payload);
      }
      state.loading = false;
    },
    removeActiveUser: (state, action) => {
      state.activeUsers = state.activeUsers.filter(user => user !== action.payload);
      state.loading = false;
    },
  },
});

export const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};  

export const createUserDocument = async(user) => {
  try{
      const db = getFirebaseFirestore();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
          email: user.email,
          uid: user.uid,
          displayName: user.email,
          status: 'online',
          lastLogin: new Date(),
      }); 
  } catch (error) {
      console.error('Error creating user document:', error);
  }
};

export const fetchUserData = (userId) => async (dispatch) => {
  if (!userId) return console.error('No user ID provided!');

  dispatch(setLoading(true));
  const db = getFirebaseFirestore();
  const userRef = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    console.log('User data:', userSnapshot.data());
    const userData = userSnapshot.data();
    dispatch(setUser({
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
    })); 
  } else {
    console.log('No such document!');
  }

  // dispatch(setLoading(false));
};

export const updateDisplayName = (uid, displayName) => async (dispatch, getState) => {
  // console.log("From updateDisplayName thunk:");
  // console.log("uid:", uid, "displayName:", displayName);
  try{
    const { user } = getState().auth;
    // console.log("user:", user);

    if (user){
      // console.log("user exists");
      dispatch(setLoading(true));
      // console.log("here")
      const db = getFirebaseFirestore();
      // console.log("db:", db);
      const usersRef = collection(db, 'users');
      // console.log("usersRef:", usersRef);
      const querySnapshot = await getDocs(query(usersRef, where("displayName", "==", displayName)));
      // console.log("querySnapshot:", querySnapshot);
      if (querySnapshot.empty) {
        // console.log("doesn't exist")
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { displayName });
        dispatch(updateUser({ displayName }));
        return true;
      } else {
        console.log('Username already exists!');
        return false; // displayName not updated because it exists
      }
    } else {
      console.log("User not found");
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  } 
};

export const updateUserEmail = (uid, email) => async (dispatch, getState) => {
  console.log("From updateDisplayName thunk:");
  console.log("uid:", uid, "email:", email);
  try{
    const { user } = getState().auth;
    console.log("user:", user);

    if (user){
      // console.log("user exists");
      dispatch(setLoading(true));
      // console.log("here")
      const db = getFirebaseFirestore();
      // console.log("db:", db);
      const usersRef = collection(db, 'users');
      // console.log("usersRef:", usersRef);
      const querySnapshot = await getDocs(query(usersRef, where("email", "==", email)));
      // console.log("querySnapshot:", querySnapshot);
      if (querySnapshot.empty) {
        // console.log("doesn't exist")
        const userAuth = getAuth().currentUser;
        await updateEmail(userAuth, email);
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { email });
        dispatch(updateUser({ email }));
        return true;
      } else {
        console.log('email already exists!');
        return false;
      }
    } else {
      console.log("User not found");
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  } 
};

export const updateUserStatus = (uid, status) => async (dispatch, getState) => {
  try{
      dispatch(setLoading(true));
      const userRef = doc(getFirebaseFirestore(), "users", uid);
      await updateDoc(userRef, {status});
      const {activeUsers} = getState().auth;
      
      if(status === 'offline' && activeUsers.includes(uid)) {
        dispatch(removeActiveUser(uid));
      } else if (!activeUsers.includes(uid)) {
        dispatch(addActiveUser(uid));
      }
  } catch (error) {
      console.error('Error getting data:', error);
  }
}

// Thunk to handle Firebase authentication state change
export const monitorAuthState = () => (dispatch, getState) => {
  initializeFirebase();
  const auth = getAuth();

  dispatch(setLoading(true));

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log("unsubscribe function called");
    // const { loading } = getState().auth;
    // dispatch(setLoading(false));
    if(user) {
      const { uid, email, displayName } = user;
      dispatch(setUser({ uid, email, displayName }));
      updateUserStatus(uid, 'online');
    } else if (!user && !dispatch(logoutUser())) {
      alert("You are not logged in! Please log in.");
    } else {
      dispatch(clearUser());
    }

    setLoading(false);
  });

  return () => unsubscribe();
};

export const logoutUser = () => async (dispatch, getState) => {
  const auth = getAuth();
  const user = getState().auth.user;
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

export const { setUser, updateUser, clearUser, setLoading, setUsername, setDisplayName, setActiveUsers, addActiveUser, removeActiveUser } = authSlice.actions;
export default authSlice.reducer;
