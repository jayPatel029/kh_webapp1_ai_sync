# Part 2 Screen Specifications

## P2-01 – Today's Patient Queue

### Screen Objective
Enable technicians to quickly identify and select the correct patient.

### Clinical Rationale
Reduce identification errors and improve safety.

### Users
Dialysis Technician, Nurse, Nephrologist.

### Navigation
Dashboard → Queue → Summary

### Wireframe
See ASCII layout in DOCX.

### UI Component Tree
Header > Filters > Content > Actions

### Layout Grid
12-column responsive

### Field Definitions
Core patient and prescription fields

### Input Types
Search, dropdown, buttons

### Mandatory Fields
Patient ID / Prescription

### Validation Rules
Block progression when required data missing

### Business Rules
Scheduled patients only

### Clinical Rules
Highlight critical alerts

### Auto-calculations
None / UF summary

### Decision Trees
Select patient → Continue

### API Requests
GET endpoints

### API Responses
JSON

### Database Mapping
patient, prescription

### Audit Events
Open patient

### Accessibility
Large controls

### Error Handling
Retry

### Empty States
No data

### Loading States
Skeleton UI

### Offline Behavior
Cached data

### Acceptance Criteria
Usable within 10 seconds

### Test Cases
Search/filter/open

### Future AI Enhancements
Priority insights

## P2-02 – Patient Summary

### Screen Objective
Provide a concise clinical overview before pre-dialysis.

### Clinical Rationale
Reduce identification errors and improve safety.

### Users
Dialysis Technician, Nurse, Nephrologist.

### Navigation
Queue → Summary → Pre-Dialysis

### Wireframe
See ASCII layout in DOCX.

### UI Component Tree
Header > Filters > Content > Actions

### Layout Grid
12-column responsive

### Field Definitions
Core patient and prescription fields

### Input Types
Search, dropdown, buttons

### Mandatory Fields
Patient ID / Prescription

### Validation Rules
Block progression when required data missing

### Business Rules
Scheduled patients only

### Clinical Rules
Highlight critical alerts

### Auto-calculations
None / UF summary

### Decision Trees
Select patient → Continue

### API Requests
GET endpoints

### API Responses
JSON

### Database Mapping
patient, prescription

### Audit Events
Open patient

### Accessibility
Large controls

### Error Handling
Retry

### Empty States
No data

### Loading States
Skeleton UI

### Offline Behavior
Cached data

### Acceptance Criteria
Usable within 10 seconds

### Test Cases
Search/filter/open

### Future AI Enhancements
Priority insights

