const adminAuth = function(req,res,next){
    const token = "password";
    const isAdminAuthorised = token==="password";
    if(!isAdminAuthorised){
        res.status(401).send("Unauthorised Access");
    }
    next();
}

const userAuth = function(req,res,next){
    const token = "userpassword@123";
    const isUserAuthorised = token === "userpassword";

    if(!isUserAuthorised){
        res.status(401).send("Unauthorised Access");
    }
    next();
}
module.exports = {
    adminAuth,userAuth,
};