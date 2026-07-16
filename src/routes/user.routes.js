import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, updatePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(
    verifyJWT,
    logoutUser);

router.route("/refreshToken").post(refreshAccessToken);

router.route("/updatePassword").post(verifyJWT, updatePassword);

router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);

router.route("/updateUser").patch(verifyJWT, updateAccountDetails);

router.route("/updateUserAvatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/getWatchHistory").get(verifyJWT, getWatchHistory);

//http://localhost:3000/api/v1/users/login
//http://localhost:3000/api/v1/users/logout
//http://localhost:3000/api/v1/users/register
//http://localhost:3000/api/v1/users/refreshToken
//http://localhost:3000/api/v1/users/updatePassword
// http://localhost:3000/api/v1/users/updateUserAvatar
// http://localhost:3000/api/v1/users/getWatchHistory
// http://localhost:3000/api/v1/users/c/:username
export default router;
