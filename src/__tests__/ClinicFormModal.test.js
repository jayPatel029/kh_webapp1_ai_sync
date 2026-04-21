import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClinicFormModal } from '../pages/clinicManagement/components/ClinicFormModal';
import * as fileuploadHelper from '../helpers/fileuploadHelper';

describe('ClinicFormModal', () => {
  it('uploads clinic icon and includes the uploaded URL in saved payload', async () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const mockFileUrl = 'https://test.example.com/icon.png';

    jest.spyOn(fileuploadHelper, 'getFileRes').mockResolvedValue({ data: { objectUrl: mockFileUrl } });

    render(
      <ClinicFormModal
        open={true}
        onClose={onClose}
        onSave={onSave}
        organizations={[]}
        initial={{
          clinicName: 'Test Clinic',
          contact: { email: 'test@example.com', phone: '' },
          organizationId: '1',
          address: { line1: 'Test St', city: 'City', state: 'State', postal: '000001', country: 'India' },
          normalBeds: 0,
          isolatedBeds: 0,
          cleaningTimeMinutes: 30,
          slotTemplates: [],
          services: [],
        }}
      />
    );

    const file = new File(['dummy-image'], 'icon.png', { type: 'image/png' });
    const input = screen.getByLabelText(/clinic icon/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(fileuploadHelper.getFileRes).toHaveBeenCalledWith(file));
    const preview = await screen.findByAltText(/clinic icon preview/i);
    expect(preview).toHaveAttribute('src', mockFileUrl);

    fireEvent.click(screen.getByText('Save Clinic'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ clinicIconURL: mockFileUrl }));
    });
  });
});
