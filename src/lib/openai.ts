import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn("OPENAI_API_KEY is not defined in environment variables. AI features will not work.");
}

export const openai = new OpenAI({
    apiKey: apiKey || "",
});
