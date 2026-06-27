import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler( async (req, _, next) => {
    try {
        const token = res.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if (!token) {
            throw new ApiError(401, "Unauthorized Request...");
        }
    
        const decodedToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (!user) {
            // TODO:
            throw new ApiError(401, "Invalid Access Token!");
        }
    
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token.")
        console.log(`Invalid Access Token ${error}`);
    }
});