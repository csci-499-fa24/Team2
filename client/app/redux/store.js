import { configureStore } from '@reduxjs/toolkit'
import dataReducer from './data'
import authReducer from '../authSlice'
export const store = configureStore({
  reducer: {
    selectedData: dataReducer,
    auth: authReducer
  },
})