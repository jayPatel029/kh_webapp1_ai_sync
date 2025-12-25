import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllContactUs, deleteContactUs } from "../../ApiCalls/contactus";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { BsTrash } from "react-icons/bs";

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
    <div className="md:flex block">
      <div className="md:flex-1 hidden md:flex">
        <Sidebar />
      </div>

      <div className=" md:flex-[5] block w-screen">
        <Navbar />
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className=" bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="border-b-gray border-b-2 p-2 pt-4 md:pb-4 font-bold text-primary tracking-wide text-2xl">
              Contact Us
            </div>
            <div>
              <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
                <thead className="text-sm text-gray-700 border-b-2 border-gray-800 ">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Sr. no.
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 w-1/5">
                      Phone No.
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Message
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 ">
                      Action
                    </th>
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
                        className="bg-white border-b cursor-pointer"
                        onClick={() => {
                          navigate(`/contactus/${c.id}`);
                        }}
                      >
                        <td className="px-6 py-4">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          {c.email}
                        </td>
                        <td className="px-6 py-4">{c.phoneno}</td>
                        <td className="px-6 py-4">{c.message}</td>
                        <td className="px-6 py-4">{displaydate}</td>
                        <td className="px-6 py-4 text-2xl">
                          <button
                            className="text-[#ff0000] inline-block mx-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleterow(c.id);
                            }}
                          >
                            <BsTrash />
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
      </div>
    </div>
  );
}
