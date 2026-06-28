import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, updatePassword, getCurrentUser, updateAccountDetails, updateUserAvatar} from "../controllers/user.controller.js";
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

router.route("/updateUser").post(verifyJWT, updateAccountDetails);

router.route("/updateUserAvatar").post(verifyJWT, updateUserAvatar);

//http://localhost:3000/api/v1/users/login
//http://localhost:3000/api/v1/users/logout
//http://localhost:3000/api/v1/users/register
//http://localhost:3000/api/v1/users/refreshToken
//http://localhost:3000/api/v1/users/updatePassword
export default router;
