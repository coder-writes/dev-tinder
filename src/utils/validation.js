const validator = require('validator');

const validateNewPassword = (req) => {
    if (!req.body || !req.body.newPassword) {
        throw new Error("Password is missing");
    }
    const { newPassword } = req.body;
    try{
        if (!validator.isStrongPassword(newPassword)) {
            throw new Error("The password is not Strong Enough");
        }
        else{
            return true;
        }
    }
    catch (err){
        return false;
    }
};
const validateSignupData = (req) =>{
    const {firstName,lastName,emailId,phoneNo,password} = req.body;

        if(!firstName || !lastName || !emailId || !phoneNo || !password){
            throw new Error("Please fill all the fields");
        }
        else if(!validator.isMobilePhone(phoneNo)){
            throw new Error("Phone number is not valid");
        }
        else if(!validator.isEmail(emailId)){
            throw new Error("Email address is not valid");
        }
        else if(!validator.isStrongPassword(password)){
            throw new Error("The password is not Strong Enough");
        }
};

const validateProfileEditData = (req) =>{
    const allowedEdits = [
        "firstName",
        "lastName",
        "email",
        "age",
        "gender",
        "about",
        "hobbies",
        "photoUrl",
    ];

    const isEditAllowed = Object.keys(req.body).every((field) => allowedEdits.includes(field));
    
    return isEditAllowed;
}


module.exports = {
    validateSignupData,
    validateProfileEditData,
    validateNewPassword,
}