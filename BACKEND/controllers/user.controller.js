import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

const DEFAULT_PROFILE_PHOTO = "/default-avatar.svg";
const allowedProfilePhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const getAuthCookieOptions = () => ({
    httpOnly:true,
    secure:process.env.NODE_ENV === "production",
    sameSite:"lax",
    path:"/"
});

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        let profilePhoto = "";
        if (req.file) {
            if (!allowedProfilePhotoTypes.has(req.file.mimetype)) {
                return res.status(400).json({
                    message:"Profile pictures must be JPG, PNG, or WebP images.",
                    success:false
                });
            }
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                folder:"hirely/profile-photos",
                resource_type:"image"
            });
            profilePhoto = cloudResponse.secure_url;
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile:{
                profilePhoto:profilePhoto || DEFAULT_PROFILE_PHOTO,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Registration failed.",
            success: false
        });
    }
}
export const updateProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message:"Choose an image to upload.",
                success:false
            });
        }
        if (!allowedProfilePhotoTypes.has(req.file.mimetype)) {
            return res.status(400).json({
                message:"Profile pictures must be JPG, PNG, or WebP images.",
                success:false
            });
        }

        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ message:"User not found.", success:false });
        }

        const fileUri = getDataUri(req.file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            folder:"hirely/profile-photos",
            resource_type:"image"
        });
        user.profile.profilePhoto = cloudResponse.secure_url;
        await user.save();

        return res.status(200).json({
            message:"Profile picture updated successfully.",
            user:{
                _id:user._id,
                fullname:user.fullname,
                email:user.email,
                phoneNumber:user.phoneNumber,
                role:user.role,
                profile:user.profile
            },
            success:true
        });
    } catch (error) {
        console.error("Unable to update profile picture:", error?.message || error);
        return res.status(500).json({
            message:"Unable to save the profile picture. Please try again or choose a smaller image.",
            success:false
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, {
            ...getAuthCookieOptions(),
            maxAge: 1 * 24 * 60 * 60 * 1000,
        }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).clearCookie("token", getAuthCookieOptions()).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;
        const userId = req.id;

        if (file && file.mimetype !== "application/pdf" && !/\.pdf$/i.test(file.originalname || "")) {
            return res.status(400).json({
                message: "Only PDF resume files are allowed.",
                success: false
            });
        }

        let cloudResponse = null;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                resource_type: "raw",
                use_filename: true,
                unique_filename: false
            });
        }

        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        if (typeof fullname === "string" && fullname.trim()) {
            user.fullname = fullname.trim();
        }
        if (typeof email === "string" && email.trim()) {
            user.email = email.trim().toLowerCase();
        }
        if (phoneNumber !== undefined && phoneNumber !== "") {
            const parsedPhoneNumber = Number(phoneNumber);
            if (!Number.isFinite(parsedPhoneNumber)) {
                return res.status(400).json({
                    message:"Enter a valid phone number.",
                    success:false
                });
            }
            user.phoneNumber = parsedPhoneNumber;
        }
        if (bio !== undefined) {
            user.profile.bio = bio;
        }
        if (skills !== undefined) {
            user.profile.skills = skills.split(",").map(skill => skill.trim()).filter(Boolean);
        }

        if (cloudResponse && file) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }


        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message:"Profile updated successfully.",
            user,
            success:true
        })
    } catch (error) {
        console.error("Unable to update profile:", error);
        if (error?.code === 11000 && error?.keyPattern?.email) {
            return res.status(409).json({
                message:"An account already uses this email address.",
                success:false
            });
        }
        return res.status(500).json({
            message:"Unable to update profile.",
            success:false
        });
    }
}