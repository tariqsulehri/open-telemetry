let SuccessResponse = class SuccessResponse{

    constructor(message,result) {
      this.status= "1"
      this.message = message;
      this.result =result; 
    }
  
    getSuccess() {
      return {
         status:this.status,
         message: this.message,
         result: this.result,
      };
    }
  };
  
  module.exports = SuccessResponse;