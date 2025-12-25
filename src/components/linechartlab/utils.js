
export const getAlertColor = (value,lowRange,highRange,lowRange2,highRange2) => {
    if (highRange != 0 && highRange2 != 0 && lowRange != 0 && lowRange2 != 0) {
        if ( value >= highRange2 ||  value <= lowRange2) {
          return "red";
        } else if ( value >= highRange &&  value <= highRange2) {
          return "yellow";
        }
        else if ( value >= lowRange &&  value <= highRange) {
          return "green";
        }
        else if ( value >= lowRange2 &&  value <= lowRange) {
          return "yellow";
        }
  
      }
      else if (highRange == 0 && highRange2 != 0 && lowRange != 0 && lowRange2 != 0) {
        if ( value >= highRange2 ||  value <= lowRange2) {
          return "red";
        } 
        else if ( value >= lowRange &&  value <= highRange2) {
          return "green";
        }
        else if ( value >= lowRange2 &&  value <= lowRange) {
          return "yellow";
        }
  
      }
      else if (highRange != 0 && highRange2 == 0 && lowRange != 0 && lowRange2 != 0) {
        if ( value <= lowRange2) {
          return "red";
        }else if( value >= highRange){
          return "yellow";
  
        }
        else if ( value >= lowRange &&  value <= highRange) {
          return "green";
        }
        else if ( value >= lowRange2 &&  value <= lowRange) {
          return "yellow";
        }
  
      }
      else if (highRange != 0 && highRange2 != 0 && lowRange == 0 && lowRange2 != 0) {
  
        if ( value >= highRange2 ||  value <= lowRange2) {
          return "red";
        } else if ( value >= highRange &&  value <= highRange2) {
          return "yellow";
        }
        else if ( value >= lowRange2 &&  value <= highRange) {
          return "green";
        }
      }
      else if (highRange != 0 && highRange2 != 0 && lowRange != 0 && lowRange2 == 0) {
  
        if ( value >= highRange2) {
          return "red";
        }else if(value<lowRange){
          return "yellow";
        }
        else if ( value >= highRange &&  value <= highRange2) {
          return "yellow";
        }
        else if ( value >= lowRange &&  value <= highRange) {
          return "green";
        }
        
  
      }
      else if (highRange == 0 && highRange2 == 0 && lowRange != 0 && lowRange2 != 0) {
        if ( value <= lowRange2) {
          return "red";
        } 
        else if ( value >= lowRange) {
          return "green";
        }
        else if ( value >= lowRange2 &&  value <= lowRange) {
          return "yellow";
        }
        
  
      }
      else if (highRange != 0 && highRange2 == 0 && lowRange == 0 && lowRange2 != 0) {
        if ( value <= lowRange2) {
          return "red";
        } else if ( value >= highRange) {
          return "yellow";
        }
        else if ( value >= lowRange2 &&  value <= highRange) {
          return "green";
        }
  
      }
      else if (highRange != 0 && highRange2 != 0 && lowRange == 0 && lowRange2 == 0) {
        if ( value >= highRange2) {
          return "red";
        } else if ( value >= highRange &&  value <= highRange2) {
          return "yellow";
        }
        else if ( value <= highRange) {
          return "green";
        }
  
      }
      else if (highRange == 0 && highRange2 != 0 && lowRange == 0 && lowRange2 != 0) {
        if ( value >= highRange2 ||  value <= lowRange2) {
          return "red";
        } 
        else if ( value >= lowRange2 &&  value <= highRange2) {
          return "green";
        }
  
      }
      else if (highRange == 0 && highRange2 != 0 && lowRange != 0 && lowRange2 == 0) {
        if ( value >= highRange2) {
          return "red";
        }
        else if ( value >= lowRange &&  value <= highRange2) {
          return "green";
        }
        else if ( value <= lowRange) {
          return "yellow";
        }
  
      }
      else if (highRange != 0 && highRange2 == 0 && lowRange != 0 && lowRange2 == 0) {
  
        if ( value >= highRange) {
          return "yellow";
        }
        else if ( value >= lowRange &&  value <= highRange) {
          return "green";
        }
        else if ( value <= lowRange) {
          return "red";
        }
  
      }
      else if (highRange != 0 && highRange2 == 0 && lowRange == 0 && lowRange2 == 0) {
  
        if (  value <= highRange) {
          return "green";
        }else{
          return "yellow";
  
        }
  
      }
      else if (highRange == 0 && highRange2 != 0 && lowRange == 0 && lowRange2 == 0) {
  
        if (  value <= highRange2) {
          return "green";
        }else{
          return "yellow";
  
        }
  
      }
      else if (highRange == 0 && highRange2 == 0 && lowRange != 0 && lowRange2 == 0) {
        if (  value >= lowRange) {
          return "green";
        }else{
          return "yellow";
  
        }
  
      }
      else if (highRange == 0 && highRange2 == 0 && lowRange == 0 && lowRange2 != 0) {
        if (  value >= lowRange2) {
          return "yellow";
        }else{
          return "red"
        }
      }
      else if (highRange == 0 && highRange2 == 0 && lowRange == 0 && lowRange2 == 0) {
        return "green";
  
    }
    

}
