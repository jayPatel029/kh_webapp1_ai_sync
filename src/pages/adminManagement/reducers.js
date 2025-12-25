export function newUserReducer(state, action) {
  switch (action.type) {
    case "name": {
      return {
        ...state,
        name: action.payload,
      };
    }
    case "email": {
      return {
        ...state,
        email: action.payload,
      };
    }
    case "role": {
      return {
        ...state,
        role: action.payload,
      };
    }
    case "phone": {
      return {
        ...state,
        phone: action.payload,
      };
    }
    case "password": {
      return {
        ...state,
        password: action.payload,
      };
    }
    case "all": {
      return {
        name: "",
        email: "",
        role: "Admin",
        phone: "",
        password: "",
        ...action.payload,
      };
    }
  }
}

export function newDoctorReducer(state, action) {
  switch (action.type) {
    case "name": {
      return {
        ...state,
        name: action.payload,
      };
    }
    case "specialities": {
      return {
        ...state,
        specialities: action.payload,
      };
    }
    case "email": {
      return {
        ...state,
        email: action.payload,
      };
    }
    case "phoneNo": {
      return {
        ...state,
        phoneNo: action.payload,
      };
    }
    case "practicingAt": {
      return {
        ...state,
        practicingAt: action.payload,
      };
    }
    case "institute": {
      return {
        ...state,
        institute: action.payload,
      };
    }
    case "licenseNo": {
      return {
        ...state,
        licenseNo: action.payload,
      };
    }
    case "doctorsCode": {
      return {
        ...state,
        doctorsCode: action.payload,
      };
    }
    case "yearsOfExperience": {
      return {
        ...state,
        yearsOfExperience: action.payload,
      };
    }
    case "address": {
      return {
        ...state,
        address: action.payload,
      };
    }
    case "photo": {
      return {
        ...state,
        photo: action.payload,
      };
    }
    case "resume": {
      return {
        ...state,
        resume: action.payload,
      };
    }
    case "reference": {
      return {
        ...state,
        reference: action.payload,
      };
    }
    case "description": {
      return {
        ...state,
        description: action.payload,
      };
    }
    case "role": {
      return {
        ...state,
        role: action.payload,
      };
    }
    case "dailyReadings": {
      return {
        ...state,
        dailyReadings: action.payload,
      };
    }
    case "dailyReadingsAlerts":{
      return {
        ...state,
        dailyReadingsAlerts: action.payload,
      };
    }
    case "dialysisReadings": {
      return {
        ...state,
        dialysisReadings: action.payload,
      };
    }

    case "email_notification": {
      return {
        ...state,
        email_notification: action.payload,
      };
    }
    case "can_export": {
      return {
        ...state,
        can_export: action.payload,
      };
    }
    case "Dialysis_updates": {
      return {
        ...state,
        Dialysis_updates: action.payload,
      };
    }
    case "all": {
      return {
        id: null,
        uniqueCode: "",
        name: "",
        specialities: [],
        email: "",
        phoneNo: "",
        practicingAt: "Government Hospital",
        institute: "",
        licenseNo: "",
        doctorsCode: "",
        yearsOfExperience: 0,
        address: "",
        photo: null,
        resume: "",
        reference: "",
        description: "",
        role: "Doctor",
        dailyReadings: [],
        dialysisReadings: [],
        email_notification: "yes",
        Dialysis_updates: "yes",
        can_export: "no",
        ...action.payload,
      };
    }
    default: {
      return state;
    }
  }
}
export function newPatientReducer(state, action) {
  switch (action.type) {
    case "name": {
      return {
        ...state,
        name: action.payload,
      };
    }
    case "aliments": {
      return {
        ...state,
        aliments: action.payload,
      };
    }
    case "number": {
      return {
        ...state,
        number: action.payload,
      };
    }
    case "gender": {
      return {
        ...state,
        gender: action.payload,
      };
    }
    case "email": {
      return {
        ...state,
        email: action.payload,
      };
    }
    case "dob": {
      return {
        ...state,
        dob: action.payload,
      };
    }
    case "profile_photo": {
      return {
        ...state,
        profile_photo: action.payload,
      };
    }
    case "registered_date": {
      return {
        ...state,
        registered_date: action.payload,
      };
    }
    case "program_assigned_to": {
      return {
        ...state,
        program_assigned_to: action.payload,
      };
    }
    case "medical_team": {
      return {
        ...state,
        medical_team: action.payload,
      };
    }
    case "program": {
      return {
        ...state,
        program: action.payload,
      };
    }
    case "eGFR": {
      return {
        ...state,
        eGFR: action.payload,
      };
    }
    case "GFR": {
      return {
        ...state,
        GFR: action.payload,
      };
    }
    case "dry_weight": {
      return {
        ...state,
        dry_weight: action.payload,
      };
    }
    case "kefr": {
      return {
        ...state,
        kefr: action.payload,
      };
    }
    case "push_notification_id": {
      return {
        ...state,
        push_notification_id: action.payload,
      };
    }
    case "fitbit_token": {
      return {
        ...state,
        fitbit_token: action.payload,
      };
    }
    case "address": {
      return {
        ...state,
        address: action.payload,
      };
    }
    case "pincode": {
      return {
        ...state,
        pincode: action.payload,
      };
    }
    case "state": {
      return {
        ...state,
        state: action.payload,
      };
    }

    case "all": {
      return {
        name: "",
        aliments: [],
        number: "",
        gender: "",
        email: "",
        dob: "",
        profile_photo: null,
        registered_date: new Date().toISOString().split("T")[0], // Default to today's date
        program_assigned_to: 1,
        medical_team: 1,
        program: "",
        eGFR: 0,
        GFR: 0,
        dry_weight: 0,
        kefr: 0,
        push_notification_id: "",
        fitbit_token: "",
        address: "",
        pincode: "",
        state: "",
        ...action.payload,
      };
    }
    
    default: {
      return state;
    }
  }
}
