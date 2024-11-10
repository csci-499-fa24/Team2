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

  export const createUserDocument = (uid, email) => async (dispatch) => {
    console.log("From createUserDocument thunk:");
    console.log(uid, email)
    try{
        const db = getFirebaseFirestore();
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            email: email,
            uid: uid,
            displayName: email,
            status: 'online',
            lastLogin: new Date(),
        }); 
    } catch (error) {
        console.error('Error creating user document:', error);
    }
  };

  // fetches from fireStore 
  export const fetchUserData = (userId) => async (dispatch) => {
    if (!userId) return console.error('No user ID provided!');
    console.log("FETCHING USER DATA")

    await dispatch(setLoading(true));
    const db = getFirebaseFirestore();
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      console.log('User data from fetchUserData:', userSnapshot.data());
      const userData = userSnapshot.data();
      await dispatch(setUser({
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
      })); 
      return userData;
    } else {
      dispatch(setLoading(false));
      console.log('No such document!');
    }
  };

  export const updateLoginTime = (uid) => async (dispatch) => {
    console.log("From updateLoginTime thunk:");
    try {
      const db = getFirebaseFirestore();
      const userRef = doc(db, "users", uid);
      const date = new Date();
      await updateDoc(userRef, {date});
    } catch (error) {
      console.error('Error updating login time:', error);
    }
  };

  export const updateDisplayName = (uid, displayName) => async (dispatch, getState) => {
    try{
      const { user } = getState().auth;
      if (user){
        dispatch(setLoading(true));

        const db = getFirebaseFirestore();
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(query(usersRef, where("displayName", "==", displayName)));
        if (querySnapshot.empty) {
          const userRef = doc(db, 'users', uid);
          await updateDoc(userRef, { displayName });
          dispatch(updateUser({ displayName }));
          return true;
        } else {
          dispatch(setLoading(false));
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

  // To be debugged! User needs to verify new email
  // Not currently in use
  export const updateUserEmail = (uid, email) => async (dispatch, getState) => {
    console.log("From updateDisplayName thunk:");
    console.log("uid:", uid, "email:", email);
    try{
      const { user } = getState().auth;
      console.log("user:", user);

      if (user){
        dispatch(setLoading(true));

        const db = getFirebaseFirestore();
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(query(usersRef, where("email", "==", email)));
        if (querySnapshot.empty) {
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

  export const updateUserStatus = (uid, displayName, status) => async (dispatch, getState) => {
    console.log("From updateUserStatus thunk:");
    console.log("uid:", uid, "displayName:", displayName, "status:", status);

    try{
      dispatch(setLoading(true));
      
      if(displayName) {
        const userRef = doc(getFirebaseFirestore(), "users", uid);
        await updateDoc(userRef, {status});

        const {activeUsers} = getState().auth;
        console.log("activeUsers from updateUserStatus:", activeUsers, "uid:", uid);
        console.log("current status", status);
          
        if(status === 'offline' && activeUsers.includes(displayName)) {
          console.log("removing active user displayName", displayName);
          await dispatch(removeActiveUser(displayName));
        }
        else if(status === 'online' && !activeUsers.includes(displayName)) {
          console.log("adding active user displayName", displayName);
          await dispatch(addActiveUser(displayName));
        }
      }
    } catch (error) {
        console.error('Error getting data:', error);
    }
  }

  let unsubscribeAuth = null;

  export const monitorAuthState = () => async(dispatch, getState) => {
    if(unsubscribeAuth) {
      unsubscribeAuth(); // calls existing function
      unsubscribeAuth = null; // resetting to prevent it from being called again
    }

    initializeFirebase();
    const auth = await getAuth();

    dispatch(setLoading(true));

    unsubscribeAuth = onAuthStateChanged(auth, async(user) => {
      if(user) {
        console.log("current user from onAuthStateChanged: ", user);
        const { uid, email, displayName } = user;
        console.log("From onAuthStateChanged:");
        console.log("uid:", uid, "email:", email, "displayName:", displayName);
        
        const userData = await dispatch(fetchUserData(uid));

        if (userData) {
          console.log("user data returned:", userData);

          if (userData.status === 'offline') {
            console.log("updating user status to online from unsubscribeAuth");
            await dispatch(updateUserStatus(userData.uid, userData.displayName, 'online'));
          }
        }
      } else {
        localStorage.removeItem('lastActivity');
        dispatch(clearUser());
      }

      dispatch(setLoading(false));
    });

    return () => {
      if(unsubscribeAuth){
        unsubscribeAuth();
        unsubscribeAuth = null;
      }
    }
  };

  export const logoutUser = () => async (dispatch, getState) => {
    const auth = getAuth();
    const user = getState().auth.user;
    try{
      if (user) {
        console.log("updating user status to offline from logoutUser");
        await dispatch(updateUserStatus(user.uid, user.displayName, 'offline'));
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  export const { setUser, updateUser, clearUser, setLoading, setUsername, setActiveUsers, addActiveUser, removeActiveUser } = authSlice.actions;
  export default authSlice.reducer;
