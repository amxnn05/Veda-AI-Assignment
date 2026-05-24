import multer from "multer";

const allowedMimeTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
]);

const storage =
    multer.memoryStorage();

export const upload =
    multer({
        storage,
        limits: {
            fileSize: 10 * 1024 * 1024
        },
        fileFilter: (_req, file, cb) => {
            if (allowedMimeTypes.has(file.mimetype)) {
                cb(null, true);
                return;
            }

            cb(
                new Error(
                    "Only PDF, JPEG, PNG, and WEBP files are supported"
                )
            );
        }
    });
