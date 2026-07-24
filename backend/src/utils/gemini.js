import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

let ai = null;

/**
 * Transcribes a local video file and returns a WebVTT string.
 * @param {string} localFilePath - Path to the local video file
 * @returns {Promise<string>} The VTT formatted string
 */
export const generateVideoTranscription = async (localFilePath) => {
    try {
        if (!ai) {
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        console.log(`[Gemini] Starting transcription for ${localFilePath}`);
        
        // 1. Upload the file to Gemini
        let file = await ai.files.upload({ 
            file: localFilePath,
            mimeType: 'video/mp4' // Assuming mp4 from multer, Gemini can handle most video formats
        });
        
        console.log(`[Gemini] Uploaded file as: ${file.name}`);

        // 2. Wait for the file to finish processing
        let fileState = await ai.files.get({ name: file.name });
        while (fileState.state === 'PROCESSING') {
            console.log(`[Gemini] Waiting for video processing...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            fileState = await ai.files.get({ name: file.name });
        }

        if (fileState.state === 'FAILED') {
            throw new Error('Video processing failed on Gemini servers.');
        }

        console.log(`[Gemini] Video processing complete. Generating transcription...`);

        // 3. Prompt the model to generate VTT
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            fileData: {
                                fileUri: file.uri,
                                mimeType: file.mimeType
                            }
                        },
                        { 
                            text: 'You are an expert video transcriber. Listen to the audio in this video and generate perfectly synced subtitles in WebVTT (.vtt) format. ONLY output the raw VTT text. Do not include markdown formatting. Start directly with WEBVTT. STRICTLY use the timestamp format HH:MM:SS.mmm --> HH:MM:SS.mmm with exactly three decimal places for milliseconds.' 
                        }
                    ]
                }
            ],
            config: {
                temperature: 0.2, // Low temperature for factual transcription
            }
        });

        // 4. Cleanup: Delete the file from Gemini servers to save space
        await ai.files.delete({ name: file.name }).catch(e => console.error(`Failed to delete file ${file.name}:`, e));

        let vttText = response.text || "";
        
        // Clean up any markdown blocks if the model ignored instructions
        vttText = vttText.replace(/```(vtt|html|txt)?/gi, '').trim();

        // STRICT VTT ENFORCEMENT: A valid WebVTT file MUST start exactly with WEBVTT 
        // followed by a blank line (two newlines). Browsers will silently reject it otherwise.
        vttText = vttText.replace(/^.*WEBVTT[\s\n]*/si, ''); // Strip everything up to and including WEBVTT
        vttText = "WEBVTT\n\n" + vttText; // Reconstruct the perfect header

        console.log(`[Gemini] Transcription complete. VTT Length: ${vttText.length}`);
        return vttText.trim();
        
    } catch (error) {
        console.error("Gemini Transcription Error:", error);
        return ""; // Return empty string on failure so it doesn't crash the video upload
    }
};

/**
 * Generates a 3-bullet point summary from text.
 * @param {string} text - The text to summarize (e.g. captions or description)
 * @returns {Promise<string>} The generated summary
 */
export const generateTextSummary = async (text) => {
    try {
        if (!ai) {
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        
        console.log(`[Gemini] Generating text summary...`);
        
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: text },
                        { text: 'You are an expert content summarizer. Create a concise, exactly 3-bullet-point summary of the main topics discussed in this text. Keep the bullet points short and punchy. DO NOT include any introductory or concluding text (like "Here is the summary:"). ONLY output the 3 bullet points starting with "- ".' }
                    ]
                }
            ],
            config: {
                temperature: 0.3,
            }
        });

        const summaryText = response.text || "";
        return summaryText.trim();
        
    } catch (error) {
        console.error("Gemini Summary Error:", error);
        return ""; // Return empty string on failure
    }
};

/**
 * Uploads a video to Gemini and generates a click-worthy title and SEO description.
 * @param {string} localFilePath - Path to the local video file
 * @returns {Promise<{title: string, description: string}>} The generated metadata
 */
export const generateVideoMetadata = async (localFilePath) => {
    try {
        if (!ai) {
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        console.log(`[Gemini] Starting metadata generation for ${localFilePath}`);
        
        let file = await ai.files.upload({ 
            file: localFilePath,
            mimeType: 'video/mp4' 
        });
        
        console.log(`[Gemini] Uploaded file as: ${file.name}`);

        let fileState = await ai.files.get({ name: file.name });
        while (fileState.state === 'PROCESSING') {
            console.log(`[Gemini] Waiting for video processing...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            fileState = await ai.files.get({ name: file.name });
        }

        if (fileState.state === 'FAILED') {
            throw new Error('Video processing failed on Gemini servers.');
        }

        console.log(`[Gemini] Video processing complete. Generating metadata...`);

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            fileData: {
                                fileUri: file.uri,
                                mimeType: file.mimeType
                            }
                        },
                        { 
                            text: 'You are an expert YouTube strategist. Analyze this video and generate a highly engaging, click-worthy title (max 60 characters) and a detailed, SEO-optimized description with hashtags. Return ONLY a valid JSON object with exactly two string keys: "title" and "description". Do not include any markdown formatting or code blocks. Just the raw JSON object.'
                        }
                    ]
                }
            ],
            config: {
                temperature: 0.7,
            }
        });

        await ai.files.delete({ name: file.name }).catch(e => console.error(`Failed to delete file ${file.name}:`, e));

        let responseText = response.text || "{}";
        responseText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        
        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", responseText);
            return { title: "", description: "" };
        }
        
    } catch (error) {
        console.error("Gemini Metadata Error:", error);
        return { title: "", description: "" };
    }
};

/**
 * Analyzes an array of comments and generates a 1-2 sentence AI Insight about audience sentiment.
 * @param {string[]} commentsArray - Array of comment strings
 * @returns {Promise<string>} The generated sentiment insight
 */
export const generateCommentSentiment = async (commentsArray) => {
    try {
        if (!ai) {
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        
        if (!commentsArray || commentsArray.length === 0) return "";
        
        console.log(`[Gemini] Generating comment sentiment for ${commentsArray.length} comments...`);
        
        const combinedComments = commentsArray.map((c, i) => `Comment ${i+1}: ${c}`).join('\n');
        
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: combinedComments },
                        { text: 'You are an expert community manager. Analyze the sentiment of these YouTube video comments. Write a concise, 1-to-2 sentence insight summarizing the general audience sentiment and highlighting any specific recurring themes, questions, or praise. Keep it positive and professional. Do NOT include phrases like "Here is the insight" or "The audience feels". Just give the direct insight.' }
                    ]
                }
            ],
            config: {
                temperature: 0.4,
            }
        });

        return response.text ? response.text.trim() : "";
        
    } catch (error) {
        console.error("Gemini Comment Sentiment Error:", error);
        return ""; // Return empty string on failure
    }
};
