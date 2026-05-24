import { PDFParse } from "pdf-parse";

export const extractPdfText =
    async (
        buffer: Buffer
    ) => {
        const parser =
            new PDFParse({
                data: buffer
            });

        try {
            const data =
                await parser.getText();

            return data.text;
        } finally {
            await parser.destroy();
        }
    };
