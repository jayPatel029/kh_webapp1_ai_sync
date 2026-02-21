import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllContactUs, deleteContactUs, insertContactUs } from "../../ApiCalls/contactus";
import PageHeader from "../../components/PageHeader";
import { ROUTES } from "../../routes/routeConstants";
import ThemeProvider from "../../components/ThemeProvider";
import { BsTrash } from "react-icons/bs";

// Component Library
import { Box, Container } from "../../component-library";

export default function ContactUs() {
  const [contactus, setContactUs] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ phoneno: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      alert("Please fill in email and message.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await insertContactUs(formData.phoneno, formData.email, formData.message);
      if (res.success) {
        alert("Message submitted successfully!");
        setFormData({ phoneno: "", email: "", message: "" });
        setShowForm(false);
        setToggle(!toggle);
      } else {
        alert("Failed to submit: " + (res.data || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting message.");
    } finally {
      setSubmitting(false);
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
            <div className="admin-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="admin-card__header-title">Contact Messages</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-[#32617d] text-white rounded-lg text-sm hover:bg-[#274f65] transition-colors"
              >
                {showForm ? 'Cancel' : '+ New Message'}
              </button>
            </div>

            {/* Inline Submission Form */}
            {showForm && (
              <div className="admin-card__body" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <form onSubmit={handleSubmitContact} className="space-y-3">
                  <div className="flex gap-3 flex-wrap">
                    <input
                      type="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#32617d]"
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phoneno}
                      onChange={(e) => setFormData({ ...formData, phoneno: e.target.value })}
                      className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#32617d]"
                    />
                  </div>
                  <textarea
                    placeholder="Message *"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#32617d]"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#00A89B] text-white rounded-lg text-sm hover:bg-[#00917e] transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              </div>
            )}

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
