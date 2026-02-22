import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getContactUsById } from "../../../ApiCalls/contactus";


export default function ContactUs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contactus, setContactUs] = useState({});
  const [allMessages, setAllMessages] = useState([]);

  const dateoptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  useEffect(() => {
    const fetchContactUs = async () => {
      try {
        const response = await getContactUsById(id);
        if (response.success && response.data.contactus) {
          setContactUs(response.data.contactus);
          setAllMessages(response.data.allMessages);
        } else {
          navigate("/contactuspage/");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchContactUs();
  }, [id]);
  return (
    <div className="flex-1 block w-full">
      <div className="bg-gray-100 min-h-screen py-4 px-2 md:py-10 md:px-40">
          <div className=" bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="border-b-gray border-b-2 p-2 pt-4 md:pb-4 font-bold text-primary tracking-wide text-lg md:text-2xl">
              Contact Us
            </div>
            <div className="p-4 border-b-gray border-b-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <div className="font-semibold text-base md:text-xl text-primary">
                Phone number:
              </div>
              <div className="text-base md:text-xl sm:px-5 text-gray-600">
                {contactus.phoneno}
              </div>
            </div>
            <div className="p-4 border-b-gray border-b-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <div className="font-semibold text-base md:text-xl text-primary">Name:</div>
              <div className="text-base md:text-xl sm:px-5 text-gray-600">
                {contactus.email}
              </div>
            </div>
            {Array.isArray(allMessages) &&
              allMessages.map((message, index) => {
                return (
                  <div key={index}>
                    <div className="p-4 border-b-gray border-b-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      <div className="font-semibold text-base md:text-xl text-primary">
                        Date:
                      </div>
                      <div className="text-base md:text-xl sm:px-5 text-gray-600">
                        {new Date(message.createdAt).toLocaleDateString(
                          "en-GB",
                          dateoptions
                        )}
                      </div>
                    </div>
                    <div className="p-4 border-b-gray border-b-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
                      <div className="font-semibold text-base md:text-xl text-primary">
                        Message:
                      </div>
                      <div className="text-base md:text-xl sm:px-5 text-gray-600">
                        {message.message}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

  );
}
