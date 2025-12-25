import { createSlice } from "@reduxjs/toolkit";
const DELETE_PERMISSION_BIT = 3;
const EDIT_PERMISSION_BIT = 2;
const VIEW_PERMISSION_BIT = 1;
export const permissionSlice = createSlice({
  name: "permission",
  initialState: {
    role_name: "Admin",
    can_vud_mr: 0,
    can_vud_am: 0,
    can_vud_ca: 0,
    can_vud_cd: 0,
    can_vud_pq: 0,
    can_vud_p: 0,
    can_vud_dr: 0,
    can_vud_dir: 0,
    can_vud_cp: 0,
    can_vud_ups: 0,
    can_vud_docr: 0,
    can_vud_fb: 0,
  },
  reducers: {
    setPermissions: (state, action) => {
      state.role_name = action.payload.role_name;
      state.manageRoles = action.payload.can_vud_mr;
      state.ailmentMaster = action.payload.can_vud_am;
      state.createAdmin = action.payload.can_vud_ca;
      state.createDoctor = action.payload.can_vud_cd;
      state.profileQuestions = action.payload.can_vud_pq;
      state.patients = action.payload.can_vud_p;
      state.dailyReadings = action.payload.can_vud_dr;
      state.dialysisReadings = action.payload.can_vud_dir;
      state.changePassword = action.payload.can_vud_cp;
      state.userProgramSelection = action.payload.can_vud_ups;
      state.doctorReports = action.payload.can_vud_docr;
      state.feedback = action.payload.can_vud_fb;

      // Extract permissions for manageRoles
      state.canViewManageRoles = ((action.payload?.can_vud_mr >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditManageRoles = ((action.payload?.can_vud_mr >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteManageRoles = ((action.payload?.can_vud_mr >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      // Extract permissions for ailmentMaster
      state.canViewAilmentMaster = ((action.payload?.can_vud_am >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditAilmentMaster = ((action.payload?.can_vud_am >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteAilmentMaster = ((action.payload?.can_vud_am >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      // Extract permissions for createAdmin
      state.canViewCreateAdmin = ((action.payload?.can_vud_ca >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditCreateAdmin = ((action.payload?.can_vud_ca >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteCreateAdmin = ((action.payload?.can_vud_ca >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      // Extract permissions for createDoctor
      state.canViewCreateDoctor = ((action.payload?.can_vud_cd >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditCreateDoctor = ((action.payload?.can_vud_cd >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteCreateDoctor = ((action.payload?.can_vud_cd >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      // Extract permissions for profileQuestions
      state.canViewProfileQuestions = ((action.payload?.can_vud_pq >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditProfileQuestions = ((action.payload?.can_vud_pq >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteProfileQuestions = ((action.payload?.can_vud_pq >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      // Extract permissions for patients
      state.canViewPatients = ((action.payload?.can_vud_p >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditPatients = ((action.payload?.can_vud_p >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeletePatients = ((action.payload?.can_vud_p >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      // Extract permissions for dailyReadings
      state.canViewDailyReadings = ((action.payload?.can_vud_dr >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditDailyReadings = ((action.payload?.can_vud_dr >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteDailyReadings = ((action.payload?.can_vud_dr >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      // Extract permissions for dialysisReadings
      state.canViewDialysisReadings = ((action.payload?.can_vud_dir >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditDialysisReadings = ((action.payload?.can_vud_dir >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteDialysisReadings = ((action.payload?.can_vud_dir >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      // Extract permissions for changePassword
      state.canViewChangePassword = ((action.payload?.can_vud_cp >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditChangePassword = ((action.payload?.can_vud_cp >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteChangePassword = ((action.payload?.can_vud_cp >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      // Extract permissions for userProgramSelection
      state.canViewUserProgramSelection = ((action.payload?.can_vud_ups >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditUserProgramSelection = ((action.payload?.can_vud_ups >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteUserProgramSelection = ((action.payload?.can_vud_ups >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      state.canViewUserProgramSelection = ((action.payload?.can_vud_docr >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditUserProgramSelection = ((action.payload?.can_vud_docr >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteUserProgramSelection = ((action.payload?.can_vud_docr >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

      state.canViewUserProgramSelection = ((action.payload?.can_vud_fb >> (VIEW_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canEditUserProgramSelection = ((action.payload?.can_vud_fb >> (EDIT_PERMISSION_BIT - 1)) & 1) !== 0;
      state.canDeleteUserProgramSelection = ((action.payload?.can_vud_fb >> (DELETE_PERMISSION_BIT - 1)) & 1) !== 0;

    },
    setIndividualPermission: (state, action) => {
      state[action.role] += action.payload;
    },
  },
});

export const { setPermissions, setIndividualPermission } =
  permissionSlice.actions;

export default permissionSlice.reducer;
