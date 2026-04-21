const fs = require('fs');

const filesToFix = [
  'src/ApiCalls/clinicApis.js',
  'src/ApiCalls/bedManagementApis.js',
  'src/ApiCalls/dialysisSessionApis.js',
  'src/ApiCalls/inventoryApis.js'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Change `${server_url}/xyz` to `${server_url}/dt/xyz`

  // Clinics
  content = content.replace(/\$\{server_url\}\/clinics/g, '${server_url}/dt/clinics');
  content = content.replace(/\$\{server_url\}\/appointments/g, '${server_url}/dt/appointments');
  content = content.replace(/\$\{server_url\}\/shifts/g, '${server_url}/dt/shifts');

  // Beds
  content = content.replace(/\$\{server_url\}\/beds/g, '${server_url}/dt/beds');

  // Dialysis Sessions
  content = content.replace(/\$\{server_url\}\/dialysis\/sessions/g, '${server_url}/dt/dialysis/sessions');

  // Inventory
  content = content.replace(/\$\{server_url\}\/inventory/g, '${server_url}/dt');
  
  // Oh, wait, in previous I saw that inventory is `${server_url}/inventory/xyz`.
  // So replacing `${server_url}/inventory` with `${server_url}/dt` handles everything underneath it.
  
  fs.writeFileSync(file, content);
});
console.log("Done fixing!");
