// /**
//  * Patient Profile Page (Refactored)
//  * Main page for displaying patient information using design-system primitives
//  * Converted from Figma design
//  * 
//  * @file src/pages/userprofile2/PatientProfilePage.jsx
//  */

// import React, { useState, useEffect } from 'react';
// import { Box, Flex } from '../../components/layout/Layout';
// import PageHeader from '../../components/PageHeader';
// import PatientNavTabs from '../../components/PatientNavTabs';
// import PatientProfileCard from '../../components/PatientProfileCard';
// import ParameterSection from '../../components/ParameterSection';
// import { Card, CardBody } from '../../components/primitives/Card';
// import { Text, Heading } from '../../components/primitives/Typography';
// import { Button } from '../../components/primitives/Button';
// import { Divider } from '../../components/layout/Layout';
// import { colors, spacing } from '../../design-system/tokens';

// // Asset constants from Figma
// const chartImageUrl = 'https://www.figma.com/api/mcp/asset/ff4f3161-c312-4400-bfdc-3da43aa15fe0';

// export const PatientProfilePage = ({
//   patientData = {
//     // name: 'Mukesh',
//     // phoneNumber: '1234567890',
//     // dob: '1996-05-28',
//     // ailments: ['Hemo Dialysis', 'CKD'],
//     // eGFR: '-',
//     // GFR: '-',
//     // dryWeight: '75 kgs',
//   },
//   ailmentDetails = [
//     // {
//     //   question: 'What is the question?',
//     //   answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus neque massa, vulputate et venenatis a, pulvinar nec arcu. Phasellus blandit placerat mauris, ac vehicula enim mollis sed. Integer eget faucibus eros, vel malesuada mi.',
//     // },
//     // {
//     //   question: 'What is the question?',
//     //   answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//     // },
//     // {
//     //   question: 'What is the question?',
//     //   answer: 'No',
//     // },
//   ],
//   generalParameters = [],
//   dialysisParameters = [],
//   onEditPatient,
//   onUploadData,
//   onDeleteReading,
// }) => {
//   const [activeTab, setActiveTab] = useState('alarms');
//   const [unreadCounts, setUnreadCounts] = useState({
//     alarms: 0,
//     diet: 0,
//     chats: 3,
//     labs: 0,
//     prescriptions: 0,
//     requisition: 0,
//   });

//   return (
//     <Box className="w-full min-h-screen bg-gray-100">
//       {/* Page Header with breadcrumb */}
//       <PageHeader
//         breadcrumbs={['My patients']}
//         title={patientData.name || 'Patient'}
//         onBackClick={() => window.history.back()}
//       />

//       {/* Navigation Tabs */}
//       <PatientNavTabs
//         activeTab={activeTab}
//         onTabChange={setActiveTab}
//         unreadCounts={unreadCounts}
//       />

//       {/* Main Content Area */}
//       <Box
//         className="p-10 max-w-7xl mx-auto"
//         style={{ background: '#fafafa', minHeight: 'calc(100vh - 200px)' }}
//       >
//         <Flex direction="column" gap={8}>
//           {/* Patient Profile Section */}
//           <PatientProfileCard
//             patient={patientData}
//             ailmentDetails={ailmentDetails}
//             onEditClick={onEditPatient}
//           />

//           {/* Divider */}
//           <Divider className="my-4" />

//           {/* General Parameters Section */}
//           <Box>
//             <Heading
//               size="lg"
//               weight="bold"
//               color="text.DEFAULT"
//               className="text-center mb-8"
//             >
//               General Parameters
//             </Heading>

//             <Flex direction="column" gap={8}>
//               {generalParameters && generalParameters.length > 0 ? (
//                 generalParameters.map((param, idx) => (
//                   <ParameterSection
//                     key={idx}
//                     title={param.title || 'Sleep'}
//                     chartImageUrl={chartImageUrl}
//                     readings={param.readings || []}
//                     onUploadData={() => onUploadData?.('general', param.id)}
//                     onEnterReading={() => console.log('Enter reading')}
//                     onUpdateRange={() => console.log('Update range')}
//                     onClearFilters={() => console.log('Clear filters')}
//                     onDeleteReading={(readingId) =>
//                       onDeleteReading?.('general', param.id, readingId)
//                     }
//                   />
//                 ))
//               ) : (
//                 <Card variant="elevated">
//                   <CardBody className="p-8">
//                     <Text
//                       size="md"
//                       color="text.muted"
//                       className="text-center"
//                     >
//                       No general parameters available.
//                     </Text>
//                   </CardBody>
//                 </Card>
//               )}
//             </Flex>
//           </Box>

//           {/* Dialysis Parameters Section */}
//           <Box>
//             <Heading
//               size="lg"
//               weight="bold"
//               color="text.DEFAULT"
//               className="text-center mb-8"
//             >
//               Dialysis Parameters
//             </Heading>

//             <Flex direction="column" gap={8}>
//               {dialysisParameters && dialysisParameters.length > 0 ? (
//                 dialysisParameters.map((param, idx) => (
//                   <ParameterSection
//                     key={idx}
//                     title={param.title || 'Sleep'}
//                     chartImageUrl={chartImageUrl}
//                     readings={param.readings || []}
//                     onUploadData={() => onUploadData?.('dialysis', param.id)}
//                     onEnterReading={() => console.log('Enter reading')}
//                     onUpdateRange={() => console.log('Update range')}
//                     onClearFilters={() => console.log('Clear filters')}
//                     onDeleteReading={(readingId) =>
//                       onDeleteReading?.('dialysis', param.id, readingId)
//                     }
//                   />
//                 ))
//               ) : (
//                 <Card variant="elevated">
//                   <CardBody className="p-8">
//                     <Text
//                       size="md"
//                       color="text.muted"
//                       className="text-center"
//                     >
//                       No dialysis parameters available.
//                     </Text>
//                   </CardBody>
//                 </Card>
//               )}
//             </Flex>
//           </Box>
//         </Flex>
//       </Box>
//     </Box>
//   );
// };

// export default PatientProfilePage;
