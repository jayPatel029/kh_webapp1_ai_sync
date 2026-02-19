import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import { server_url } from "../../constants/constants.js";
import axiosInstance from "../../helpers/axios/axiosInstance.js";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import {
  Box,
  Container,
  Button
} from "../../component-library";

const UserRoles = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axiosInstance
      .get(`${server_url}/roles`)
      .then((res) => {
        setRoles(res.data.data);
        console.log(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const deleteRole = (role_name) => {
    console.log("object", role_name);
    axiosInstance
      .delete(`${server_url}/roles/byName/${role_name}`)
      .then((res) => {
        alert("Role deleted successfully");
        window.location.reload();
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <Container className="py-4 px-4 md:px-6 mx-0">
            <PageHeader
              title="User Roles"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "User Roles", active: true }
              ]}
            />
          </Container>
        </Box>

         
          <div className="admin-page-content">
            <div className="admin-card">
              <div className="admin-card__header flex justify-between items-center">
                <h3 className="admin-card__title">User Roles</h3>
                <Link to="/users/roles/new">
                  <Button variant="primary">
                    Add Role
                  </Button>
                </Link>
              </div>

              <div className="admin-card__body">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Role Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role, index) => (
                        <tr key={index}>
                          <td>{role.role_name}</td>
                          <td>
                            <div className="flex gap-2">
                              <Link to={`/edit-role/${role.role_name}`}>
                                <button className="admin-action-btn admin-action-btn--edit" title="Edit Role">
                                  <BsPencilSquare size={18} />
                                </button>
                              </Link>

                              <button
                                onClick={() => deleteRole(role.role_name)}
                                className="admin-action-btn admin-action-btn--delete"
                                title="Delete Role"
                              >
                                <BsTrash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
      </Box>
    </ThemeProvider>
  );
};

export default UserRoles;

