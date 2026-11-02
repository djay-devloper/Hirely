import test from "node:test";
import assert from "node:assert/strict";
import getDataUri from "../utils/datauri.js";

test("uploaded file buffers are converted to Cloudinary-compatible data URIs", () => {
    const result = getDataUri({
        mimetype:"image/png",
        buffer:Buffer.from("image")
    });

    assert.equal(result.content, "data:image/png;base64,aW1hZ2U=");
});

test("invalid uploaded file data is rejected", () => {
    assert.throws(
        () => getDataUri({ mimetype:"image/png", buffer:"not a buffer" }),
        /uploaded file with a valid MIME type/
    );
});
