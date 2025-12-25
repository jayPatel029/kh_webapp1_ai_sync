# Admin Management

## Create Admin section
* Admins can add, delete, edit admin details
* Provides list of all admins
* Users are identified on the basis of their emails(Primary Key)

## Create Doctors secion
* Create Doctors and medical staff accounts
* When a doctor is created, the doctor is automatically added to the users table along with the doctors table
* Doctors and medical staff have different fields that need to be filled.
* On the basis of the Role(Doctor/Medical Staff), the specialities options will change which are fetched from the consts.js file
* Doctors will require additional license number and doctor code fields. Medical staff will be given the option to upload a resume
* In doctors's daily and dialysis readings, doctors can add the various readings that they want their patients to fill
* These fieds are fetched from the Daily Readings and Dialysis Reading Tables.

## Roles
* Create, edit, delete the roles to be used in the web app
* On the basis of these roles the rest of the routes in the website can be accessed
* The data for the roles is stored in binary format with 1 bit for view, edit, delete respectively. Eg. 110 for view and edit, which will be saved as 6 in the database