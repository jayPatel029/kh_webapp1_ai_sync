import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllContactUs, deleteContactUs } from "../../ApiCalls/contactus";
import PageHeader from "../../components/PageHeader";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import { BsTrash } from "react-icons/bs";

// Component Library
import { Box, Container } from "../../component-library";

export default function ContactUs() {
  const [contactus, setContactUs] = useState([]);
  const [toggle, setToggle] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchContactUs = async () => {
      try {
        const response = await getAllContactUs();
        if (response.success) {
          setContactUs(response.data.contactus);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchContactUs();
  }, [toggle]);

  const deleterow = async (id) => {
    try {
      const response = await deleteContactUs(id);
      if (response.success) {
        setToggle(!toggle);
        alert("ContactUs deleted successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white">
           
            <PageHeader
              title="Contact Us"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "Contact Us", active: true }
              ]}
              onBack={() => navigate(ROUTES.HOME)}
            />
           
        </Box>

         
          {/* Contact Us Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__header-title">Contact Messages</h2>
            </div>
            <div className="admin-card__body">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Email</th>
                      <th>Phone No.</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactus.map((c, index) => {
                      const dateoptions = {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      };
                      const displaydate = new Date(c.createdAt).toLocaleDateString("en-GB", dateoptions);
                      return (
                        <tr
                          key={index}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            navigate(`/contactus/${c.id}`);
                          }}
                        >
                          <td>{index + 1}</td>
                          <td>{c.email}</td>
                          <td>{c.phoneno}</td>
                          <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.message}
                          </td>
                          <td>{displaydate}</td>
                          <td>
                            <button
                              className="admin-action-btn admin-action-btn--delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleterow(c.id);
                              }}
                            >
                              <BsTrash size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </Box>

    </ThemeProvider>
  );
}
