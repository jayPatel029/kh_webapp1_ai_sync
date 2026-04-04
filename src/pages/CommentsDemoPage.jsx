/**
 * Comments Demo Page
 * Showcases the PatientCommentsModal component
 * Route: /commentsdemo
 */

import React, { useState } from 'react';
import PatientCommentsModal from '../components/modals/PatientCommentsModal';

const CommentsDemoPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const mockPatient = {
    id: 1,
    name: 'Mukesh',
    avatar: null
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Comments Modal Demo</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Patient Comments Modal</h2>
          <p className="text-gray-600 mb-4">
            The modal is already open. Click "View / comment" on any comment to see the FileViewModal.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Mock Data:</strong> The modal displays sample comments fetched via <code className="bg-blue-100 px-2 py-1 rounded">getDoctorsComments()</code>
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Open Modal
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Uses <code className="bg-gray-200 px-2 py-0.5 rounded">getDoctorsComments()</code> API</li>
            <li>✓ Click "View / comment" opens FileViewModal with file ID</li>
            <li>✓ Displays comment icons, date, time, and content</li>
            <li>✓ Footer with Close, View profile, Consult Doctor, and Message buttons</li>
            <li>✓ Responsive design with proper spacing</li>
          </ul>
        </div>
      </div>

      {/* Patient Comments Modal */}
      <PatientCommentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientName={mockPatient.name}
        patientId={mockPatient.id}
        onViewProfile={() => {
          console.log('View profile clicked');
          setIsModalOpen(false);
        }}
        onConsultDoctor={() => {
          console.log('Consult doctor clicked');
        }}
        onMessage={() => {
          console.log('Message clicked');
        }}
      />
    </div>
  );
};

export default CommentsDemoPage;
