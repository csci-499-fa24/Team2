import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import store from './store';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, store);

const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
});

const persistor = persistStore(store);
