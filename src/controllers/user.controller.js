import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const  generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken(); 

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong! while generating while refresh and access tokens");
    }
};

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

    if(
        [fullName, email, username, password].some((field) => { return !field?.trim() === ""})
    ){
        throw new ApiError(400, "Please provide all required fields");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(existedUser) {
        throw new ApiError(409, "User Already Exists..");
    };

    console.log("files path :======= ", req.files?.avatar?.[0]?.path);
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

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

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // check if user sent username and password or not
    // (find User) 
    // if password is correct or not
    // if correct then send access and refresh token and success login message
    // send tokens in cookie
    // if not-correct then show error message

    const {username, email, password} = res.body;

    if(!username || !email) {
        throw new ApiError(400, "Username or Email is required!")
    }
    if(!password) {
        throw new ApiError(400, "Password is also required!")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    });

    if(!user) {
        throw new ApiError(404, "User does not exist.");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect! Invalida user credentials!!");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);        

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const option = {
        httpOnly: true,
        secure: true
    };

    if(!loggedInUser) {
        throw new ApiError(500, "Something went wrong while login");
    }

    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {
                    user: loggedInUser, accessToken, refreshToken
                }, "User loggedIn successfully!")
            );


});

const logoutUser = asyncHandler( async (req, res) => {
    // clear cookie
    // clear refreshToken, accessToken

    const userId = {};
});


export { registerUser, 
        loginUser,
        logoutUser };

