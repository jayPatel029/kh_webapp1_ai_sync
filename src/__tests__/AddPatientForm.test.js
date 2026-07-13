import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AddPatientForm from '../pages/patient/AddPatientForm';

describe('AddPatientForm - Age Calculation', () => {
  it('automatically calculates age when Date of Birth (dob) is changed', () => {
    const { container } = render(
      <MemoryRouter>
        <AddPatientForm isOpen={true} />
      </MemoryRouter>
    );

    const dobInput = container.querySelector('input[name="dob"]');
    const ageInput = container.querySelector('input[name="age"]');

    expect(dobInput).toBeInTheDocument();
    expect(ageInput).toBeInTheDocument();

    // Verify initial values are empty
    expect(dobInput.value).toBe('');
    expect(ageInput.value).toBe('');

    // Change DOB to 30 years ago
    const today = new Date();
    const dobDate = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
    const dobString = dobDate.toISOString().split('T')[0];

    fireEvent.change(dobInput, { target: { value: dobString } });

    // Age should be calculated as 30
    expect(ageInput.value).toBe('30');
  });

  it('clears age when Date of Birth (dob) is cleared', () => {
    const { container } = render(
      <MemoryRouter>
        <AddPatientForm isOpen={true} />
      </MemoryRouter>
    );

    const dobInput = container.querySelector('input[name="dob"]');
    const ageInput = container.querySelector('input[name="age"]');

    // First set it
    const today = new Date();
    const dobDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
    const dobString = dobDate.toISOString().split('T')[0];

    fireEvent.change(dobInput, { target: { value: dobString } });
    expect(ageInput.value).toBe('25');

    // Clear it
    fireEvent.change(dobInput, { target: { value: '' } });
    expect(ageInput.value).toBe('');
  });
});
