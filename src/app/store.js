import { configureStore } from '@reduxjs/toolkit'
import permissionSlice from '../redux/permissionSlice'
import themeSlice from '../redux/themeSlice'

export default configureStore({
  reducer: {
    permission: permissionSlice,
    theme: themeSlice,
  }
})