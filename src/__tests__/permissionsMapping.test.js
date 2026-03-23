import {
  getRoleAuthArray,
  mapFormPermissionsToAuthArray,
} from "../helpers/permissions";

describe("permissions auth_arr mapping", () => {
  it("maps backend auth_arr order to current UI permission field order", () => {
    const roleData = {
      auth_arr: [1, 1, 7, 3, 1, 7, 3, 3, 0, 1, 7, 1, 0, 7],
      can_vud_mr: 1,
      can_vud_am: 1,
      can_vud_ca: 7,
      can_vud_cd: 3,
      can_vud_pq: 1,
      can_vud_p: 7,
      can_vud_dr: 3,
      can_vud_dir: 3,
      can_vud_cp: 0,
      can_vud_ups: 1,
      can_vud_docr: 7,
      can_vud_fb: 1,
      can_vud_la: 0,
      can_vud_lo: 7,
    };

    expect(getRoleAuthArray(roleData)).toEqual([
      1, // can_vud_mr
      1, // can_vud_am
      7, // can_vud_ca
      3, // can_vud_cd
      1, // can_vud_pq
      0, // can_vud_la
      7, // can_vud_p
      3, // can_vud_dr
      3, // can_vud_dir
      0, // can_vud_cp
      1, // can_vud_ups
      7, // can_vud_lo
      1, // can_vud_fb
    ]);
  });

  it("serializes form permissions back to backend auth_arr order", () => {
    const permissions = {
      manageRoles: { view: true, edit: false, delete: false },
      ailmentMaster: { view: true, edit: false, delete: false },
      createAdmin: { view: true, edit: true, delete: true },
      createDoctor: { view: true, edit: true, delete: false },
      profileQuestions: { view: true, edit: false, delete: false },
      languageMaster: { view: false, edit: false, delete: false },
      patients: { view: true, edit: true, delete: true },
      dailyReadings: { view: true, edit: true, delete: false },
      dialysisReadings: { view: true, edit: true, delete: false },
      changePassword: { view: false, edit: false, delete: false },
      userProgramSelection: { view: true, edit: false, delete: false },
      logs: { view: true, edit: true, delete: true },
      feedback: { view: true, edit: false, delete: false },
    };

    expect(mapFormPermissionsToAuthArray(permissions)).toEqual([
      1, // can_vud_mr
      1, // can_vud_am
      7, // can_vud_ca
      3, // can_vud_cd
      1, // can_vud_pq
      7, // can_vud_p
      3, // can_vud_dr
      3, // can_vud_dir
      0, // can_vud_cp
      1, // can_vud_ups
      0, // can_vud_docr (not shown in current UI)
      1, // can_vud_fb
      0, // can_vud_la
      7, // can_vud_lo
    ]);
  });
});
