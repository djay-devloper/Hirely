const getDataUri = (file) => {
    if (!Buffer.isBuffer(file?.buffer) || !file.mimetype) {
        throw new TypeError("An uploaded file with a valid MIME type is required.");
    }

    return {
        content:`data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    };
}

export default getDataUri;