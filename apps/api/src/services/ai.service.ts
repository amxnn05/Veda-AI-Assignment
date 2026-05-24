import OpenAI from "openai";

const client = new OpenAI({
    apiKey:
        process.env.GROQ_API_KEY,

    baseURL:
        "https://api.groq.com/openai/v1"
});

export const generatePaper =
    async (prompt: string) => {
        try {
            const completion =
                await client.chat.completions.create(
                    {
                        model:
                            "llama-3.3-70b-versatile",

                        messages: [
                            {
                                role: "user",
                                content: prompt
                            }
                        ],

                        temperature: 0.7
                    }
                );

            const content =
                completion.choices?.[0]
                    ?.message?.content;

            if (!content) {
                throw new Error(
                    "Empty AI response"
                );
            }

            return content;
        } catch (error) {
            console.error(
                "AI Error:",
                error
            );

            throw error;
        }
    };