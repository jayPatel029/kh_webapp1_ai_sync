import { configureStore } from '@reduxjs/toolkit'
import permissionSlice from '../redux/permissionSlice'

export default configureStore({
  reducer: {
    permission: permissionSlice,
  }
})