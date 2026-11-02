import express from "express";
import { login, logout, register, updateProfile, updateProfilePhoto } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { profilePhotoUpload, singleUpload } from "../middlewares/multer.js";
 
const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);
router.route("/profile/photo").put(isAuthenticated,profilePhotoUpload,updateProfilePhoto);

export default router;
