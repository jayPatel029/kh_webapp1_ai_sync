/**
 * Patient Alert Card Component
 * Displays aggregated alerts for a patient
 * 
 * @file src/pages/adminDashboard/components/PatientAlertCard.jsx
 */

import React from 'react';
import { Heading } from '../../../component-library/primitives/Typography';
import { Button } from '../../../component-library/primitives/Button';
import { Badge } from '../../../component-library/primitives/Badge';
import { dummyadmin } from '../../../assets';

const PatientAlertCard = ({ patient, onAction }) => {
    const {
        name,
        prescriptionCount = 0,
        commentCount = 0,
        alertCount = 0,
        dialysisCount = 0,
        avatar,
    } = patient;

    return (
        <div className="patient-alert-card">
            {/* Patient Avatar */}
            <div className="patient-avatar">
                <img
                    src={avatar || dummyadmin}
                    alt={name}
                    className="avatar-image"
                />
            </div>

            {/* Patient Info and Actions */}
            <div className="patient-info">
                <Heading as="h3" size="xl" className="patient-name">
                    {name}
                </Heading>

                <div className="patient-actions">
                    {prescriptionCount > 0 && (
                        <Button
                            variant="solid"
                            size="sm"
                            className="action-btn action-btn--prescription"
                            onClick={() => onAction(patient, 'prescription')}
                            style={{ backgroundColor: '#00cccc' }}
                        >
                            {prescriptionCount} Approve Prescription
                        </Button>
                    )}

                    {dialysisCount > 0 && (
                        <Button
                            variant="solid"
                            size="sm"
                            className="action-btn action-btn--dialysis"
                            onClick={() => onAction(patient, 'dialysis')}
                            style={{ backgroundColor: '#6b21a8' }} // Violet
                        >
                            {dialysisCount} Dialysis Tech Alerts
                        </Button>
                    )}

                    {commentCount > 0 && (
                        <Button
                            variant="success"
                            size="sm"
                            className="action-btn action-btn--comment"
                            onClick={() => onAction(patient, 'comment')}
                        >
                            {commentCount} Comments
                        </Button>
                    )}

                    {alertCount > 0 && (
                        <Button
                            variant="danger"
                            size="sm"
                            className="action-btn action-btn--alert"
                            onClick={() => onAction(patient, 'alert')}
                        >
                            {alertCount} Alerts
                        </Button>
                    )}

                    {prescriptionCount === 0 && commentCount === 0 && alertCount === 0 && dialysisCount === 0 && (
                        <Badge variant="gray" className="no-alerts-badge">
                            0 alerts
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientAlertCard;
