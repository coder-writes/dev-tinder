const validator = require('validator');

const validateSignupData = (req) =>{
    const {fullName,email,phoneNo,password} = req.body;

        if(!fullName){
            
            throw new Error("Name is not Valid");
        }
        else if(!validator.isMobilePhone(phoneNo)){
            throw new Error("Phone number is not valid");
        }
        else if(!validator.isEmail(email)){
            throw new Error("Email address is not valid");
        }
        else if(!validator.isStrongPassword(password)){
            throw new Error("The password is not Strong Enough");
        }
};


module.exports = {
    validateSignupData
}