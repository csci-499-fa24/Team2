import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: "",
}

export const dataSlice = createSlice({
  name: 'selectedData',
  initialState,
  reducers: {
    setSelectedData: (state, action) => {
      state.value = action.payload
    },
    setSelectedDataToNULL: (state) => {
      state.value = ""
    }
  },
})

// Action creators are generated for each case reducer function
export const { setSelectedData, setSelectedDataToNULL } = dataSlice.actions

export default dataSlice.reducer