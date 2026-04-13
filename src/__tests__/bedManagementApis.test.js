/**
 * Bed Management API Tests
 * @file src/__tests__/bedManagementApis.test.js
 *
 * Tests for all bed management API endpoints
 * Run with: npm test -- bedManagementApis.test.js
 *
 * NOTE: Before running tests, ensure your backend server is running
 * and all endpoints are available at ${server_url}
 */

import {
  getAllBeds,
  getBedsByStatus,
  getBedById,
  assignPatientToBed,
  unassignPatientFromBed,
  setQuarantineBed,
  getPatientDetails,
  updateBedStatus,
} from '../ApiCalls/bedManagementApis';

// Test data generators
const generateTestBed = (id, status = 'EMPTY') => ({
  id: `bed-${id}`,
  bed_number: `${id}`,
  status,
  patient_id: status === 'OCCUPIED' ? `patient-${id}` : null,
  bed_type: status === 'QUARANTINE' ? 'QUARANTINE' : 'NORMAL',
  ward: 'ICU',
});

const generateTestPatient = (id, isInfectious = false) => ({
  id: `patient-${id}`,
  name: `Patient ${id}`,
  is_infectious: isInfectious,
  patient_code: `P-${id}`,
});

// ============================================================================
// Test 1: Fetch All Beds
// ============================================================================
async function testGetAllBeds() {
  console.log('\n📋 TEST 1: Fetch All Beds');
  console.log('Endpoint: GET /api/beds/all');
  
  try {
    const result = await getAllBeds();
    
    if (result.success) {
      console.log('✅ Success! Got beds:');
      console.log(`   Total beds: ${result.data?.length || 0}`);
      if (result.data?.length > 0) {
        console.log(`   Sample bed: ${JSON.stringify(result.data[0], null, 2)}`);
      }
    } else {
      console.log('❌ Failed to fetch beds');
      console.log(`   Error: ${result.data?.message || result.data}`);
    }
    return result.success;
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Test 2: Fetch Beds by Status
// ============================================================================
async function testGetBedsByStatus() {
  console.log('\n🔍 TEST 2: Fetch Beds by Status');
  const statuses = ['OCCUPIED', 'EMPTY', 'QUARANTINE'];
  
  for (const status of statuses) {
    console.log(`Endpoint: GET /api/beds/status/${status}`);
    
    try {
      const result = await getBedsByStatus(status);
      
      if (result.success) {
        console.log(`✅ ${status}: ${result.data?.length || 0} beds found`);
      } else {
        console.log(`❌ ${status}: Failed - ${result.data?.message || result.data}`);
      }
    } catch (error) {
      console.log(`❌ ${status}: Exception - ${error.message}`);
    }
  }
}

// ============================================================================
// Test 3: Fetch Bed by ID
// ============================================================================
async function testGetBedById() {
  console.log('\n🛏️  TEST 3: Fetch Bed by ID');
  console.log('Endpoint: GET /api/beds/{bedId}');
  
  // First get all beds to find a valid ID
  const allBedsResult = await getAllBeds();
  if (!allBedsResult.success || !allBedsResult.data?.length) {
    console.log('❌ Could not get beds to test getBedById');
    return false;
  }
  
  const testBedId = allBedsResult.data[0].id;
  console.log(`Testing with bed ID: ${testBedId}`);
  
  try {
    const result = await getBedById(testBedId);
    
    if (result.success) {
      console.log('✅ Success! Got bed:');
      console.log(`   ${JSON.stringify(result.data, null, 2)}`);
    } else {
      console.log('❌ Failed to fetch bed');
      console.log(`   Error: ${result.data?.message || result.data}`);
    }
    return result.success;
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Test 4: Get Patient Details (with isolation status)
// ============================================================================
async function testGetPatientDetails() {
  console.log('\n👤 TEST 4: Get Patient Details');
  console.log('Endpoint: GET /api/patients/{patientId}');
  
  // Try a known patient ID
  const testPatientIds = ['1', 'patient-1', 'P-1'];
  
  for (const patientId of testPatientIds) {
    console.log(`Testing with patient ID: ${patientId}`);
    
    try {
      const result = await getPatientDetails(patientId);
      
      if (result.success) {
        console.log(`✅ Success! Got patient:`, result.data);
        return true;
      } else {
        console.log(`❌ Not found: ${result.data?.message || result.data}`);
      }
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
    }
  }
  
  console.log('⚠️  Could not find test patient');
  return false;
}

// ============================================================================
// Test 5: Assign Patient to Bed
// ============================================================================
async function testAssignPatientToBed() {
  console.log('\n➕ TEST 5: Assign Patient to Bed');
  console.log('Endpoint: POST /api/beds/assign');
  
  // Get an empty bed
  const emptyBedsResult = await getBedsByStatus('EMPTY');
  if (!emptyBedsResult.success || !emptyBedsResult.data?.length) {
    console.log('❌ No empty beds available for testing');
    return false;
  }
  
  const testBped = emptyBedsResult.data[0];
  const testPatientId = 'patient-test-1';
  
  console.log(`Assigning patient ${testPatientId} to bed ${testBped.id}`);
  
  try {
    const result = await assignPatientToBed({
      bed_id: testBped.id,
      patient_id: testPatientId,
      assignment_notes: 'Routine assignment',
    });
    
    if (result.success) {
      console.log('✅ Patient assigned successfully!');
      console.log(`   ${JSON.stringify(result.data, null, 2)}`);
      return true;
    } else {
      console.log('❌ Failed to assign patient');
      console.log(`   Error: ${result.data?.message || result.data}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Test 6: Unassign Patient from Bed
// ============================================================================
async function testUnassignPatientFromBed() {
  console.log('\n➖ TEST 6: Unassign Patient from Bed');
  console.log('Endpoint: POST /api/beds/unassign');
  
  // Get an occupied bed
  const occupiedBedsResult = await getBedsByStatus('OCCUPIED');
  if (!occupiedBedsResult.success || !occupiedBedsResult.data?.length) {
    console.log('❌ No occupied beds available for testing');
    return false;
  }
  
  const testBed = occupiedBedsResult.data[0];
  const patientId = testBed.patient_id;
  
  console.log(`Unassigning patient ${patientId} from bed ${testBed.id}`);
  
  try {
    const result = await unassignPatientFromBed({
      bed_id: testBed.id,
      patient_id: patientId,
    });
    
    if (result.success) {
      console.log('✅ Patient unassigned successfully!');
      console.log(`   ${JSON.stringify(result.data, null, 2)}`);
      return true;
    } else {
      console.log('❌ Failed to unassign patient');
      console.log(`   Error: ${result.data?.message || result.data}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Test 7: Quarantine Bed
// ============================================================================
async function testQuarantineBed() {
  console.log('\n🚫 TEST 7: Set Bed as Quarantine');
  console.log('Endpoint: POST /api/beds/{bedId}/quarantine');
  
  // Get an empty bed to quarantine
  const emptyBedsResult = await getBedsByStatus('EMPTY');
  if (!emptyBedsResult.success || !emptyBedsResult.data?.length) {
    console.log('❌ No empty beds available for testing');
    return false;
  }
  
  const testBed = emptyBedsResult.data[0];
  
  console.log(`Marking bed ${testBed.id} as quarantine`);
  
  try {
    const result = await setQuarantineBed(testBed.id, {
      reason: 'COVID-19 positive patient',
      quarantine_status: true,
      estimated_duration: '7 days',
    });
    
    if (result.success) {
      console.log('✅ Bed marked as quarantine successfully!');
      console.log(`   ${JSON.stringify(result.data, null, 2)}`);
      return true;
    } else {
      console.log('❌ Failed to quarantine bed');
      console.log(`   Error: ${result.data?.message || result.data}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Test 8: Validate Quarantine Restrictions
// ============================================================================
async function testQuarantineValidation() {
  console.log('\n🛡️  TEST 8: Quarantine Validation (Infectious Patient → Normal Bed)');
  console.log('Expected Result: Should FAIL - infectious patients cannot go to normal beds');
  
  // Get an infectious patient
  const testPatientId = 'patient-infectious-1';
  
  // Get a normal (non-quarantine) empty bed
  const emptyBedsResult = await getBedsByStatus('EMPTY');
  if (!emptyBedsResult.success || !emptyBedsResult.data?.length) {
    console.log('❌ No empty beds available for testing');
    return false;
  }
  
  const normalBed = emptyBedsResult.data.find((b) => b.bed_type !== 'QUARANTINE');
  if (!normalBed) {
    console.log('⚠️  No normal beds found for validation test');
    return null; // Inconclusive
  }
  
  console.log(`Attempting to assign infectious patient to normal bed`);
  
  try {
    const result = await assignPatientToBed({
      bed_id: normalBed.id,
      patient_id: testPatientId,
      assignment_notes: 'This should fail - infectious patient to normal bed',
    });
    
    if (!result.success) {
      console.log('✅ Correctly rejected! Infectious patient cannot be assigned to normal bed');
      console.log(`   Reason: ${result.data}`);
      return true;
    } else {
      console.log('❌ SECURITY ERROR: Infectious patient was assigned to normal bed!');
      console.log(`   ${JSON.stringify(result.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Test 9: Update Bed Status
// ============================================================================
async function testUpdateBedStatus() {
  console.log('\n🔄 TEST 9: Update Bed Status');
  console.log('Endpoint: PUT /api/beds/{bedId}/status');
  
  // Get any bed
  const allBedsResult = await getAllBeds();
  if (!allBedsResult.success || !allBedsResult.data?.length) {
    console.log('❌ No beds available for testing');
    return false;
  }
  
  const testBed = allBedsResult.data[0];
  
  console.log(`Updating status of bed ${testBed.id}`);
  
  try {
    const result = await updateBedStatus(testBed.id, {
      status: 'MAINTENANCE',
      notes: 'Routine maintenance',
    });
    
    if (result.success) {
      console.log('✅ Bed status updated successfully!');
      console.log(`   ${JSON.stringify(result.data, null, 2)}`);
      return true;
    } else {
      console.log('❌ Failed to update bed status');
      console.log(`   Error: ${result.data?.message || result.data}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           💉 BED MANAGEMENT API TEST SUITE 💉              ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n⚠️  IMPORTANT: Ensure these conditions before running:');
  console.log('   1. Backend server is running');
  console.log('   2. Database has sample data');
  console.log('   3. You are connected to the correct server\n');

  const results = [];

  // Run tests sequentially
  results.push({ name: 'Get All Beds', passed: await testGetAllBeds() });
  results.push({ name: 'Get Beds by Status', passed: await testGetBedsByStatus() });
  results.push({ name: 'Get Bed by ID', passed: await testGetBedById() });
  results.push({ name: 'Get Patient Details', passed: await testGetPatientDetails() });
  results.push({ name: 'Assign Patient to Bed', passed: await testAssignPatientToBed() });
  results.push({ name: 'Unassign Patient from Bed', passed: await testUnassignPatientFromBed() });
  results.push({ name: 'Quarantine Bed', passed: await testQuarantineBed() });
  results.push({ name: 'Quarantine Validation', passed: await testQuarantineValidation() });
  results.push({ name: 'Update Bed Status', passed: await testUpdateBedStatus() });

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                      TEST SUMMARY                            ');
  console.log('═══════════════════════════════════════════════════════════════');

  let passed = 0;
  let failed = 0;
  let inconclusive = 0;

  results.forEach((result) => {
    if (result.passed === true) {
      console.log(`✅ ${result.name}`);
      passed++;
    } else if (result.passed === false) {
      console.log(`❌ ${result.name}`);
      failed++;
    } else {
      console.log(`⚠️  ${result.name} (inconclusive)`);
      inconclusive++;
    }
  });

  console.log('\n───────────────────────────────────────────────────────────────');
  console.log(`Passed: ${passed}  |  Failed: ${failed}  |  Inconclusive: ${inconclusive}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  return { passed, failed, inconclusive };
}

// Export for use in tests
export {
  testGetAllBeds,
  testGetBedsByStatus,
  testGetBedById,
  testGetPatientDetails,
  testAssignPatientToBed,
  testUnassignPatientFromBed,
  testQuarantineBed,
  testQuarantineValidation,
  testUpdateBedStatus,
  runAllTests,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
