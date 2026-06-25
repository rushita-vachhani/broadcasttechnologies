import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    // ask user to share data
    // get data from user and validate if all the required fields are present + check for avatar and images
    // check if user already exists: check username and email
    // if user exists then show message like already exists
    // upload image to cloudinary + avatar
    // if not exists then create user object and create entry in DB
    // remove password and refresh token from response
    // check for user creation
    // return response
   
    const {fullName, username, email, password} = req.body;
    console.log(fullName, username, email, password);
    

});

export { registerUser };