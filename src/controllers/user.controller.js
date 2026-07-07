import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import JsonWebTokenError from "jsonwebtoken";

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

    const {username, email, password} = req.body;
    console.log(`username is:-------- ${!username}`);

    if(!username && !email) {
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
        throw new ApiError(401, "Password is incorrect! Invalid user credentials!!");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);        

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
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

    await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    
    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully!"));

});

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    console.log(`incomingRefreshToken is........... ${incomingRefreshToken}`);
    if (!incomingRefreshToken) {
        throw new ApiError(401,"To get new token, Need to pass refreshToken so unauthorized request!")
    }

    try {
        const decodedToken = JsonWebTokenError.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        );
    
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401,"Invalid refresh token!")
        };
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh token is invalid or used!!")
        }
    
        const options = {httpOnly: true, secure: true};
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
        return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new ApiResponse(200, {accessToken, RefreshToken: newRefreshToken}, "Access Token Refreshed Successfully.")
                );
                
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token..");   
    }
    
});

const updatePassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    console.log(`printing old password HERE:---------${oldPassword}`);

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Entered old password is incorrect!");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
            .status(200)
            .json(new ApiResponse(200, {newPassword}, "Password updated successfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    // console.log(new ApiResponse(200, req.user, "Current user fetched successfully"));
    return res
            .status(200)
            .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
    
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {email, fullName} = req.body;

    if(!email || !fullName){
        throw new ApiError(400, "No fields passed in request..");
    }

    const user = await User.findByIdAndUpdate(
                            req.user?._id,
                        {
                            $set: {
                                fullName, 
                                email,
                            }
                        }, {
                            new: true
                        }).select("-password");
    
    return res
            .status(200)
            .json(new ApiResponse(200, user, "User data updated successfully!!"));
});

const updateUserAvatar = asyncHandler( async (req, res) => {
   const avatarLocalPath = req.file?.path; 
   console.log(`avatar local path printing: ------- ${avatarLocalPath}`);

   if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing!")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   if(!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar!")
   }

   const user = await User.findByIdAndUpdate(
                                            req.user?._id,
                                            {
                                                $set: {
                                                    avatar: avatar.url
                                                }
                                            },
                                            {new: true}
                                            ).select("-password");

   return res
            .status(200)
            .json(new ApiResponse(200, user, "User avatar updated successfully!!"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing!");
    }

    const channel = await User.aggregate([
        {
            $match: {username: username?.toLowerCase()}
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount: {$size: "$subscribers"},
                channelsSubscribedToCount: {$size: "$subscribedTo"},
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                createdAt: 1,
                updatedAt: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ]);

    console.log(`channel is: ----------- ${channel}`);
    if(!channel?.length){
        throw new ApiError(404, "Channel does not exist!");
    }

    return res
            .status(200)
            .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully!"));

});

export { registerUser, 
        loginUser,
        logoutUser,
        refreshAccessToken,
        updatePassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        getUserChannelProfile };
