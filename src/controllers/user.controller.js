import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
   
    // const {fullName, username, email, password} = req.body;
    // console.log(fullName, username, email, password);

    if(
        [fullName, email, username, password].some((field) => { return field?.trim() === "" })
    ){
        throw new ApiError(400, "Please provide all required fields");
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    });

    if(existedUser) {
        throw new ApiError(409, "User Already Exists..");
    };

    console.log("files path :======= ", req.files?.avatar[0]?.path);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required!")
    };
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar image is required!")
    }

    const user = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully!")
    );

});

export { registerUser };