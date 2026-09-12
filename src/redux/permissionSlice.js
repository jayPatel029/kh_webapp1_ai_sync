import { createSlice } from "@reduxjs/toolkit";
import { buildPermissionState, getInitialPermissionState } from "../helpers/permissions";

export const permissionSlice = createSlice({
  name: "permission",
  initialState: getInitialPermissionState(),
  reducers: {
    setPermissions: (state, action) => {
      Object.assign(state, buildPermissionState(action.payload));
    },
    clearPermissions: () => getInitialPermissionState(),
    setIndividualPermission: (state, action) => {
      state[action.role] += action.payload;
    },
  },
});

export const { setPermissions, clearPermissions, setIndividualPermission } =
  permissionSlice.actions;

export default permissionSlice.reducer;
