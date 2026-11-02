import express from "express";
import { login, logout, register, updateProfile, updateProfilePhoto } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { profilePhotoUpload, singleUpload } from "../middlewares/multer.js";
import { rateLimit } from "express-rate-limit";
 
const router = express.Router();
const authRateLimit = rateLimit({
    windowMs:15 * 60 * 1000,
    limit:10,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    message:{ message:"Too many authentication attempts. Please try again later.", success:false }
});

router.route("/register").post(authRateLimit, singleUpload, register);
router.route("/login").post(authRateLimit, login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);
router.route("/profile/photo").put(isAuthenticated,profilePhotoUpload,updateProfilePhoto);

export default router;
