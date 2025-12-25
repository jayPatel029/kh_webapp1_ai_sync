import "./App.css";
import AdminDashboard from "./pages/adminDashboard/AdminDashboard";
import AdminManagement from "./pages/adminManagement/AdminManagement";
import AlimentMaster from "./pages/alimentMaster/AlimentMaster";
import ChangePassword from "./pages/changePassword/ChangePassword";
import DailyReadings from "./pages/dailyReadings/DailyReadings";
import DialysisReadings from "./pages/dialysisReadings/DialysisReadings";
import Patient from "./pages/patient/Patient";
import ProfileQuestions from "./pages/profileQuestion/ProfileQuestions";
import UserProgramSelection from "./pages/userProgramSelection/UserProgramSelection";
import Login from "./pages/login/Login";
import UniqueUserProgramSelection from "./pages/userProgramSelection/UniqueUserProgramSelection"
// import UserProfile from './pages/userProfile/UserProfile'
import UserRoles from "./pages/adminManagement/UserRoles";
import AddRole from "./pages/adminManagement/AddRole";
import DoctorManagement from "./pages/adminManagement/DoctorManagement";
import Userprescription from "./pages/Userprescription/Userprescription";
import UserLabReports from "./pages/UserLabReports/UserLabReports";
import UserDietDetails from "./pages/UserDietDetails/UserDietDetails";
import UserRequisition from "./pages/UserRequisition/UserRequisition";
import ShowAlarms from "./pages/ShowAlarms/ShowAlarms";
import ManageParameters from "./pages/ManageParameters/ManageParameters";
import UserProfile from "./pages/userprofile2/UserProfile";
import AdminChat from "./pages/adminchat/AdminChat";
import DoctorChat from "./pages/doctorChat";
import ProtectedRoute from "./helpers/ProtectedRoute";
import LanguageMaster from "./pages/language";
import EditRole from "./pages/adminManagement/EditRole";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DoctorLogin from "./pages/doctorLogin/DoctorLogin";
import DoctorDashboard from "./pages/doctorDashboard/DoctorDashboard";
import UserListManage from "./components/UserListAdmin/UserListManage";
import CSVReader from "./pages/labreports/Labreports";
import UserMedicalTeam from "./components/UserListAdmin/UserMedicalTeam";
import ContactUsPage from "./pages/contactus/contactpage";
import ContactUs from "./pages/contactus/singleContact";
import ForgotPassword from "./pages/forgotpassword";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import AppLogout from "./components/logout/Logout";
import Kfre from "./pages/kfre/Kfre"
import AiChat from "./pages/AIChat/AiChat";
import DoctorReport from "./pages/doctorReport/DoctorReport";
import UniqueUserprescription from "./pages/Userprescription/UniqueUserprescription";
import DeletePatient from "./pages/patient/DeletePatient";
import AddPatientForm from "./pages/patient/AddPatientForm";
import KfreSingle from "./pages/kfre/KfreSingle";
import DailyReadingsCsv1 from "./pages/dailyReadings/DailyReadingCsv1";
import DialysisReadingCsv from "./pages/dialysisReadings/DialysisReadingCsv";
import LogsPage from "./pages/AuditLogs/patientLog";
import DocLogPage from "./pages/AuditLogs/DoctorLog";
import DelPatient from "./pages/patient/delPatient";
import Logs from "./pages/AuditLogs/Logs";
import ProfileQuestionCsv from "./pages/profileQuestion/ProfileQuestionCsv";

function App() {
  return (
    <AppLogout>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/">
            <Route
              index
              element={
                <ProtectedRoute routeName={"AdminDashboard"}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-admin"
              element={
                <ProtectedRoute routeName={"CreateAdmin"}>
                  <AdminManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="alimentMaster"
              element={
                <ProtectedRoute routeName={"AlimentMaster"}>
                  <AlimentMaster />
                </ProtectedRoute>
              }
            />
            <Route
              path="changePassword"
              element={
                <ProtectedRoute routeName={"ChangePassword"}>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="dailyReadings"
              element={
                <ProtectedRoute routeName={"DailyReadings"}>
                  <DailyReadings />
                </ProtectedRoute>
              }
            />
            <Route
              path="dialysisReadings"
              element={
                <ProtectedRoute routeName={"DialysisReadings"}>
                  <DialysisReadings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/DeletedPatient"
              element={
                <ProtectedRoute routeName={"DelPatient"}>
                  <DelPatient />
                </ProtectedRoute>
              } />
            <Route
              path="kfre/:id"
              element={
                <ProtectedRoute routeName={"krfe/:id"}>
                  <KfreSingle />
                </ProtectedRoute>
              }
            />
            <Route
            path="dailyReadingsCsv"
            element={
              <ProtectedRoute routeName={"Daily"}>
                < DailyReadingsCsv1/>
              </ProtectedRoute>
            }
            />
            <Route
              path="DialysisReadingsCsv"
              element={
                <ProtectedRoute routeName={"DialysisReadingsCsv"}>
                  <DialysisReadingCsv />
                </ProtectedRoute>
              }
            />
            <Route
              path="Patientlogs"
              element={
                <ProtectedRoute routeName={"Patientlogs"}>
                  <LogsPage />
                </ProtectedRoute>
              } />
              <Route
              path="logs"
              element={
                <ProtectedRoute routeName={"logs"}>
                  <Logs />
                </ProtectedRoute>
              } />
              <Route
              path="Doclogs"
              element={
                <ProtectedRoute routeName={"Doclogs"}>
                  <DocLogPage />
                </ProtectedRoute>
              } />
            <Route
              path="profileQuestions"
              element={
                <ProtectedRoute routeName={"ProfileQuestions"}>
                  <ProfileQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="userProgramSelection"
              element={
                <ProtectedRoute routeName={"UserProgramSelection"}>
                  <UserProgramSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="userProgramSelection/:id"
              element={
                <ProtectedRoute routeName={"UserProgramSelection"}>
                  <UniqueUserProgramSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="userProfile"
              element={
                <ProtectedRoute routeName={"UserProfile"}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="userProfile/:id"
              element={
                <ProtectedRoute routeName={"UserProfile"}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient"
              element={
                <ProtectedRoute routeName={"Patient"}>
                  <Patient />
                </ProtectedRoute>
              }
            />
            <Route
              path="patient/:id"
              element={
                <ProtectedRoute routeName={"Patient"}>
                  <Patient />
                </ProtectedRoute>
              }
            />
            <Route path="Addpatient"
              element={
                <ProtectedRoute routeName={"Patient"}>
                  <AddPatientForm/>
                </ProtectedRoute>
              } />
            <Route
              path="Deletepatient/:id"
              element={
                <ProtectedRoute routeName={"Patient"}>
                  <DeletePatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="manageRoles"
              element={
                <ProtectedRoute routeName={"UserRoles"}>
                  <UserRoles />
                </ProtectedRoute>
              }
            />
            <Route
              path="add-role"
              element={
                <ProtectedRoute routeName={"AddRole"}>
                  <AddRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="createDoctor"
              element={
                <ProtectedRoute routeName={"DoctorManagement"}>
                  <DoctorManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="Userprescription"
              element={
                <ProtectedRoute routeName={"Userprescription"}>
                  <Userprescription />
                </ProtectedRoute>
              }
            />
            <Route
              path="kfre"
              element={
                <ProtectedRoute routeName={"kfre"}>
                  <Kfre/>
                </ProtectedRoute>
              }
            />
            <Route
              path="Userprescription/:id"
              element={
                <ProtectedRoute routeName={"Userprescription"}>
                  <Userprescription />
                </ProtectedRoute>
              }
            />
            <Route
              path="Userprescription/:id/:prescriptionId"
              element={
                <ProtectedRoute >
                  <UniqueUserprescription />
                </ProtectedRoute>
              }
            />
            <Route
              path="Userlabreports"
              element={
                <ProtectedRoute routeName={"UserLabReports"}>
                  <UserLabReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="Userlabreports/:id"
              element={
                <ProtectedRoute routeName={"UserLabReports"}>
                  <UserLabReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="Userdietdetails/:id"
              element={
                <ProtectedRoute routeName={"UserDietDetails"}>
                  <UserDietDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="Userrequisition"
              element={
                <ProtectedRoute routeName={"UserRequisition"}>
                  <UserRequisition />
                </ProtectedRoute>
              }
            />
            <Route
              path="Userrequisition/:id"
              element={
                <ProtectedRoute routeName={"UserRequisition"}>
                  <UserRequisition />
                </ProtectedRoute>
              }
            />
            <Route
              path="showalarms/:pid"
              element={
                <ProtectedRoute routeName={"ShowAlarms"}>
                  <ShowAlarms />
                </ProtectedRoute>
              }
            />
            <Route
              path="manageparameters/:pid"
              element={
                <ProtectedRoute routeName={"ManageParameters"}>
                  <ManageParameters />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-doctor"
              element={
                <ProtectedRoute routeName={"DoctorManagement"}>
                  <DoctorManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="adminChat/:pid"
              element={
                <ProtectedRoute routeName={"AdminChat"}>
                  <AdminChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctorChat/:pid"
              element={
                <ProtectedRoute routeName={"DoctorChat"}>
                  <DoctorChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctorLogin"
              element={
                // <ProtectedRoute>
                <DoctorLogin />
                // </ProtectedRoute>
              }
            />
            <Route
              path="doctorDashboard"
              element={
                <ProtectedRoute routeName={"DoctorDashboard"}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
             <Route
              path="aiChat"
              element={
                <ProtectedRoute routeName={"aiChat"}>
                  <AiChat/>
                </ProtectedRoute>
              }
            />
            <Route
              path="languageMaster"
              element={
                <ProtectedRoute routeName={"LanguageMaster"}>
                  <LanguageMaster />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit-role/:rolename"
              element={
                <ProtectedRoute routeName={"EditRole"}>
                  <EditRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="userListManage/:pid"
              element={
                <ProtectedRoute routeName={"UserListManage"}>
                  <UserListManage />
                </ProtectedRoute>
              }
            />
            <Route
              path="userMedicalTeam/:pid"
              element={
                <ProtectedRoute routeName={"UserMedicalTeam"}>
                  <UserMedicalTeam />
                </ProtectedRoute>
              }
            />

            <Route
              path="labReports"
              element={
                <ProtectedRoute routeName={"LabReports"}>
                  <CSVReader />
                </ProtectedRoute>
              }
            />
            <Route
              path="contactus/:id"
              element={
                <ProtectedRoute routeName={"ContactUs"}>
                  <ContactUs />
                </ProtectedRoute>
              }
            />
            <Route
              path="ProfileQuestionCsv"
              element={
                <ProtectedRoute routeName={"ContactUs"}>
                  <ProfileQuestionCsv />
                </ProtectedRoute>
              }
            />
            <Route
              path="contactuspage"
              element={
                <ProtectedRoute routeName={"ContactUsPage"}>
                  <ContactUsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctorReport"
              element={
                <ProtectedRoute routeName={"doctorReport"}>
                  <DoctorReport/>
                </ProtectedRoute>
              }
            />

            <Route path="forgotpassword" element={<ForgotPassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppLogout>
  );
}

export default App;
