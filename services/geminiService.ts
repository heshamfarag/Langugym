import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VOCAB_EXTRACTION_PROMPT } from '../constants';
import { ImportPreviewItem, Story } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Get API key from Vite environment variables
// Vite exposes env vars prefixed with VITE_ via import.meta.env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

// --- AUDIO HELPERS ---

// Cache to store audio buffers for words/sentences to reduce API latency and cost
const audioCache = new Map<string, AudioBuffer>();
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert Raw PCM 24kHz to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const numChannels = 1;
  const sampleRate = 24000;
  
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize Int16 to Float32 (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playTextToSpeech = async (text: string, onEnded?: () => void): Promise<{ stop: () => void }> => {
  if (!API_KEY) {
      console.error("API Key missing for TTS");
      return { stop: () => {} };
  }

  const ctx = getAudioContext();
  
  // 1. Check Cache
  if (audioCache.has(text)) {
      const buffer = audioCache.get(text)!;
      return playBuffer(buffer, ctx, onEnded);
  }

  try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: text }] }],
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore', 'Puck', 'Fenrir', 'Charon', 'Zephyr'
                  },
              },
          },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio data returned");

      const audioBytes = base64ToUint8Array(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx);
      
      // Cache it
      audioCache.set(text, audioBuffer);
      
      return playBuffer(audioBuffer, ctx, onEnded);

  } catch (error) {
      console.error("TTS Error:", error);
      // Fallback to browser TTS if API fails
      const utterance = new SpeechSynthesisUtterance(text);
      if (onEnded) utterance.onend = onEnded;
      window.speechSynthesis.speak(utterance);
      return { stop: () => window.speechSynthesis.cancel() };
  }
};

const playBuffer = (buffer: AudioBuffer, ctx: AudioContext, onEnded?: () => void) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    if (onEnded) {
        source.onended = onEnded;
    }
    
    source.start();
    return { stop: () => {
        try { source.stop(); } catch(e) {}
    }};
};


// --- EXISTING FUNCTIONS ---

export const extractVocabulary = async (text: string): Promise<ImportPreviewItem[]> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: VOCAB_EXTRACTION_PROMPT }] },
        { role: 'user', parts: [{ text: `Input Text:\n${text}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['word', 'meaning', 'example'],
              },
            },
          },
        },
      },
    });

    const output = JSON.parse(response.text || '{"words": []}');
    
    // Transform to ImportPreviewItem
    return output.words.map((item: any) => ({
      word: item.word,
      meaning: item.meaning,
      example: item.example,
      selected: true,
    }));

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract vocabulary. Please try again.");
  }
};

export const processStoryText = async (text: string): Promise<Story> => {
    if (!API_KEY) {
        throw new Error("API Key is missing.");
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
    Analyze the following text and format it as a language learning story.
    1. Generate a short, engaging Title.
    2. Identify 5-7 key vocabulary words used in the text.
    3. Create 3-5 quiz questions based on the text.
       - Use 'FILL_BLANK' type for sentences from the text where the target word is missing.
       - Use 'MATCHING' type for defining a word from the text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'user', parts: [{ text: `STORY TEXT:\n${text}` }] }
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        targetWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['FILL_BLANK', 'MATCHING'] },
                                    targetWord: { type: Type.STRING },
                                    question: { type: Type.STRING },
                                    correctAnswer: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['type', 'targetWord', 'question', 'correctAnswer']
                            }
                        }
                    },
                    required: ['title', 'targetWords', 'questions']
                }
            }
        });
        
        const data = JSON.parse(response.text || '{}');
        
        // Add IDs and raw content
        return {
            id: uuidv4(),
            title: data.title || 'Imported Story',
            content: text,
            targetWords: data.targetWords || [],
            questions: (data.questions || []).map((q: any) => ({
                id: uuidv4(),
                ...q
            })),
            isCustom: true
        };

    } catch (error) {
        console.error("Gemini Story Error:", error);
        throw new Error("Failed to process story.");
    }
}