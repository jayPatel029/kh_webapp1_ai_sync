import { questionTypes } from "./consts";

export function newQuestionReducer(state, action) {
  switch (action.type) {
    case "ailment": {
      return {
        ...state,
        ailment: action.payload,
      };
    }
    case "type": {
      if (
        action.payload !== "MultipleChoice" ||
        action.payload !== "SelectAnyOne"
      ) {
        return {
          ...state,
          type: action.payload,
          options: null,
        };
      }
      return {
        ...state,
        type: action.payload,
      };
    }
    case "name": {
      return {
        ...state,
        name: action.payload,
      };
    }
    case "options": {
      return {
        ...state,
        options: action.payload,
      };
    }
    case "all": {
      return {
        id:null,
        ailment: [],
        type: questionTypes[0].value,
        name: "",
        options: "",
        ...action.payload,
      };
    }
    default: {
      return state;
    }
  }
}
