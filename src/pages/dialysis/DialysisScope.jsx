import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import OrganizationSelector from '../../components/OrganizationSelector';
import ClinicSelector from '../../components/ClinicSelector';
import { getClinics, getOrganizations } from '../../ApiCalls/clinicApis';

const FILTER_ORG_KEY = 'dt_filter_org_id';
const FILTER_CLINIC_KEY = 'dt_filter_clinic_id';
export const DT_NAVBAR_H = 72;
export const DT_SCOPE_BAR_H = 52;

const DialysisScopeContext = createContext(null);

function dialysisSubRole(user) {
  return String(
    user?.dialysisCenterRole ||
      user?.dialysis_center_role ||
      user?.roleInDialysis ||
      user?.dialysisRole ||
      user?.role_in_dialysis_center ||
      '',
  ).toLowerCase();
}

function canSwitchOrgClinic(roleName, subRole) {
  const role = String(roleName || '').trim().toLowerCase();
  if (role === 'admin' || role === 'psadmin') return true;
  if (role === 'dialysis technician' && subRole === 'manager') return true;
  return false;
}

function assignedOrgId(user) {
  return String(
    localStorage.getItem('organization_id') ||
      user?.organization_id ||
      user?.org_id ||
      user?.organizationId ||
      '',
  ).trim();
}

function assignedClinicId(user) {
  return String(
    localStorage.getItem('clinic_id') ||
      user?.clinic_id ||
      user?.clinicId ||
      '',
  ).trim();
}

export function useDialysisScope() {
  const ctx = useContext(DialysisScopeContext);
  if (ctx) return ctx;
  return {
    selectedOrgId: '',
    selectedClinicId: '',
    setSelectedOrgId: () => {},
    setSelectedClinicId: () => {},
    organizations: [],
    clinics: [],
    canSwitch: false,
    hideBar: true,
    menuStickyTop: DT_NAVBAR_H,
  };
}

export function DialysisScopeProvider({ children, hideBar = false }) {
  const roleName = useSelector((state) => state.permission?.role_name);
  const user = useSelector((state) => state.auth?.user || {});
  const subRole = dialysisSubRole(user);
  const canSwitch = canSwitchOrgClinic(roleName, subRole);
  const lockedOrg = assignedOrgId(user);
  const lockedClinic = assignedClinicId(user);

  const [organizations, setOrganizations] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedOrgId, setOrgId] = useState(lockedOrg);
  const [selectedClinicId, setClinicId] = useState(lockedClinic);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [orgsResult, clinicsResult] = await Promise.all([getOrganizations(), getClinics()]);
        if (cancelled) return;
        if (orgsResult.success) {
          const orgList = Array.isArray(orgsResult.data?.data) ? orgsResult.data.data : (orgsResult.data || []);
          setOrganizations(Array.isArray(orgList) ? orgList : []);
        }
        if (clinicsResult.success) {
          const clinicList = Array.isArray(clinicsResult.data?.data) ? clinicsResult.data.data : (clinicsResult.data || []);
          setClinics(Array.isArray(clinicList) ? clinicList : []);
        }
      } catch (err) {
        console.warn('Could not load dialysis org/clinic scope:', err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!canSwitch) {
      setOrgId(lockedOrg);
      setClinicId(lockedClinic);
      return;
    }
    const savedOrg = localStorage.getItem(FILTER_ORG_KEY);
    const savedClinic = localStorage.getItem(FILTER_CLINIC_KEY);
    setOrgId(savedOrg !== null ? savedOrg : lockedOrg);
    setClinicId(savedClinic !== null ? savedClinic : lockedClinic);
  }, [canSwitch, lockedOrg, lockedClinic]);

  const setSelectedOrgId = useCallback((val) => {
    if (!canSwitch) return;
    const next = val == null ? '' : String(val);
    setOrgId(next);
    setClinicId('');
    localStorage.setItem(FILTER_ORG_KEY, next);
    localStorage.setItem(FILTER_CLINIC_KEY, '');
  }, [canSwitch]);

  const setSelectedClinicId = useCallback((val) => {
    if (!canSwitch) return;
    const next = val == null ? '' : String(val);
    setClinicId(next);
    localStorage.setItem(FILTER_CLINIC_KEY, next);
  }, [canSwitch]);

  const menuStickyTop = hideBar ? DT_NAVBAR_H : DT_NAVBAR_H + DT_SCOPE_BAR_H;

  const value = useMemo(
    () => ({
      selectedOrgId,
      selectedClinicId,
      setSelectedOrgId,
      setSelectedClinicId,
      organizations,
      clinics,
      canSwitch,
      hideBar,
      menuStickyTop,
    }),
    [selectedOrgId, selectedClinicId, setSelectedOrgId, setSelectedClinicId, organizations, clinics, canSwitch, hideBar, menuStickyTop],
  );

  return (
    <DialysisScopeContext.Provider value={value}>
      <div style={{ ['--dt-menu-top']: `${menuStickyTop}px` }}>
        {children}
      </div>
    </DialysisScopeContext.Provider>
  );
}

function filterWrapClass(active) {
  return `dt-roster-filter ${active ? 'dt-roster-filter--on' : 'dt-roster-filter--off'}`;
}

export function DialysisScopeBar() {
  const {
    selectedOrgId,
    selectedClinicId,
    setSelectedOrgId,
    setSelectedClinicId,
    organizations,
    clinics,
    canSwitch,
    hideBar,
  } = useDialysisScope();

  if (hideBar) return null;

  const orgName = organizations.find((o) => String(o.id) === String(selectedOrgId))?.name || (selectedOrgId ? `Org ${selectedOrgId}` : 'No organization');
  const clinic = clinics.find((c) => String(c.id) === String(selectedClinicId));
  const clinicName = clinic?.clinic_name || clinic?.name || (selectedClinicId ? `Clinic ${selectedClinicId}` : 'No clinic');

  return (
    <div
      className="dt-scope-bar sticky z-30 bg-white border-b border-slate-200 px-4 md:pl-6 md:pr-8"
      style={{
        top: DT_NAVBAR_H,
        minHeight: DT_SCOPE_BAR_H,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        overflow: 'visible',
        paddingTop: 6,
        paddingBottom: 6,
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .dt-scope-bar .form-control {
          width: 100%;
          min-width: 0;
          height: 40px;
          margin: 0;
          position: relative;
        }
        .dt-scope-bar .custom-select,
        .dt-scope-bar .custom-select__trigger {
          width: 100%;
          height: 40px;
        }
        .dt-scope-bar .dt-roster-filter--off .custom-select__trigger {
          opacity: 0.9;
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .dt-scope-bar .dt-roster-filter--off .custom-select__label,
        .dt-scope-bar .dt-roster-filter--off .custom-select__label--placeholder {
          color: #64748b;
          font-weight: 400;
        }
        .dt-scope-bar .dt-roster-filter--on .custom-select__trigger {
          opacity: 1;
          background: #fff;
          border-color: #0f766e;
        }
        .dt-scope-bar .dt-roster-filter--on .custom-select__label {
          color: #0f172a;
          font-weight: 600;
        }
      `}</style>
      {canSwitch ? (
        <>
          <div className={filterWrapClass(Boolean(selectedOrgId))} style={{ width: 180, minWidth: 180, maxWidth: 180, height: 40, flex: '0 0 180px' }}>
            <OrganizationSelector
              orgId={selectedOrgId}
              setOrgId={setSelectedOrgId}
              organizations={organizations}
              label=""
              size="md"
              className="dt-scope-select"
              placeholder="All organizations"
            />
          </div>
          <div className={filterWrapClass(Boolean(selectedClinicId))} style={{ width: 180, minWidth: 180, maxWidth: 180, height: 40, flex: '0 0 180px' }}>
            <ClinicSelector
              orgId={selectedOrgId}
              clinicId={selectedClinicId}
              setClinicId={setSelectedClinicId}
              clinics={clinics}
              label=""
              size="md"
              className="dt-scope-select"
              placeholder="All clinics"
            />
          </div>
        </>
      ) : (
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
          {orgName}
          <span style={{ color: '#94a3b8', fontWeight: 500 }}> · </span>
          {clinicName}
        </div>
      )}
    </div>
  );
}
