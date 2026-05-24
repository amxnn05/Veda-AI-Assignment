import Tesseract from "tesseract.js";

export const extractImageText =
    async (
        imageBuffer: Buffer
    ) => {
        const {
            data: { text }
        } =
            await Tesseract.recognize(
                imageBuffer,
                "eng"
            );

        return text;
    };