# Admin and Doctor Chat

## Admin Chat

* `Admin Chat` and `Doctor Chat` are specific for each patient on the basis of patient id.
* `Admin Chat` can be used by doctors to chat with the admin assigned to them.
* The admin chat is implemented as a group chat where `superadmin@KifaytiHealth.com` is considered the second user by default and all admins assigned to the doctor can access this chat.
* From the admin's perspective it appears as different chat belonging to each doctor for that specific patient

## Doctor Chat

* The `Doctor Chat` can be used by doctors to communicate with other doctors via the web app
* Each doctor can select the doctor they want to communicate with and message that particular doctor.
* From the admin perspective, the admins can view all the chats between the doctors.
* The admin has to select the two users and then they can view the entire chat history.  