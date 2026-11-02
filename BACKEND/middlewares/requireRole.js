import { User } from "../models/user.model.js";

const requireRole = (...roles) => async (req, res, next) => {
    try {
        const user = await User.findById(req.id).select("role");
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({
                message:"You are not authorized to access this resource.",
                success:false
            });
        }
        next();
    } catch (error) {
        console.error("Role authorization failed:", error);
        return res.status(500).json({
            message:"Unable to verify account permissions.",
            success:false
        });
    }
};

export default requireRole;
