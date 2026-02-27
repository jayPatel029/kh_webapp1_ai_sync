// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import UnifiedListTable from "../../components/table/UnifiedListTable";
// import { getRoles, deleteRoleByName } from "../../ApiCalls/authapis";
// import PageHeader from "../../components/PageHeader";
// import { useNavigate } from "react-router-dom";
// import { ROUTES } from "../../routes/routeConstants";
// import ThemeProvider from "../../components/ThemeProvider";
// import {
//   Box,
//   Button,
//   Flex
// } from "../../component-library";
// import { SearchBar } from "../../components";
// import isMobile from "../../components/mobile/useIsMobile";
// import { useAdminToast } from "../../components/AdminToast";

// const UserRoles = () => {
//   const navigate = useNavigate();
//   const [roles, setRoles] = useState([]);
//   const { showToast, ToastContainer } = useAdminToast();

//   useEffect(() => {
//     getRoles()
//       .then((res) => {
//         if (res.success) {
//           setRoles(res.data?.data || []);
//           console.log(res.data?.data);
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }, []);

//   const deleteRole = (role_name) => {
//     deleteRoleByName(role_name)
//       .then((res) => {
//         showToast("Role deleted successfully!", "success");
//         setRoles((prev) => prev.filter((r) => r.role_name !== role_name));
//       })
//       .catch((err) => {
//         console.log(err);
//         showToast("Failed to delete role", "error");
//       });
//   };

//   return (
//     <ThemeProvider>
//       <Box className="flex-1 flex flex-col min-w-0">
//         <Box className="sticky top-[56px] z-20 bg-white">

//           <PageHeader
//             title="User Roles"
//             breadcrumbs={[
//               { label: "Dashboard", path: "/" },
//               { label: "User Roles", active: true }
//             ]}
//             onBack={() => navigate(ROUTES.HOME)}
//           />

//         </Box>


//         <div className="admin-page-content">
//           <div className="admin-card">
//             <div className="admin-card__header flex justify-between pb-6 items-center">
//               <h3 className="admin-card__title">Total Roles: <span className="font-bold">{roles.length}</span></h3>
//               <div className={`flex items-center gap-3 ${isMobile ? "w-full" : "w-auto"}`}>
//                 <div className={isMobile ? "flex-1" : "w-64"}>
//                   <SearchBar placeholder="Search roles..." onSearch={(value) => console.log("Search for:", value)} />
//                 </div>
//                 {/* <Link to="/users/roles/new">
//                   <Button variant="primary">
//                     Add Role
//                   </Button>
//                 </Link> */}
//               </div>
//             </div>

//             <div className="admin-card__body">
//               <div className="admin-table-container">
//                 <UnifiedListTable
//                   columns={[
//                     { key: 'role_name', label: 'Role Name', type: 'text' },
//                     { key: 'actions', label: 'Action', type: 'actions', width: '120px' }
//                   ]}
//                   data={roles}
//                   onEdit={(row) => navigate(`/edit-role/${row.role_name}`)}
//                   onDelete={(row) => deleteRole(row.role_name)}
//                   // enableSearch={true}
//                   // renderSearchUI={true}
//                   // searchKeys={["role_name"]}
//                   emptyMessage="No roles found"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//         <ToastContainer />
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default UserRoles;

