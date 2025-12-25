# Alarms

## Show Alarms

The `ShowAlarms.jsx` component is used to display all the alarms that have already been set.

## Alarm Modal

The `AlarmModal.jsx` component is used to create any new alarms for that particular patient. 

There are 4 types of alarms which can be changed from the `consts.js` file. Dialysis and Health parameters are fetched from `dialysis` and `daily readings` respectively. Prescription alarms allow the user to view the alram on the right side of the modal on clicking on the image.

The doctor can be selected. This doctor is fetched from the list of doctors assigned to the patient

