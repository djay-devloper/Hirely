import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits:{ fileSize:5 * 1024 * 1024 }
});

const handleUpload = (middleware) => (req, res, next) => {
    middleware(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            const message = error.code === "LIMIT_FILE_SIZE"
                ? "Image and resume files must be 5 MB or smaller."
                : "Unable to process the uploaded file.";
            return res.status(400).json({ message, success:false });
        }
        if (error) return next(error);
        next();
    });
};

export const singleUpload = handleUpload(upload.single("file"));
export const profilePhotoUpload = handleUpload(upload.single("profilePhoto"));