import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemini-embedding-001";
const DIM = 768; // must match the listings.embedding column and the ingest side

/**
 * Embed a search query. Uses RETRIEVAL_QUERY so it lands in the same space as
 * the listings, which the ingest job embeds as RETRIEVAL_DOCUMENT.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const res = await ai.models.embedContent({
    model: MODEL,
    contents: text,
    config: { taskType: "RETRIEVAL_QUERY", outputDimensionality: DIM },
  });
  const values = res.embeddings?.[0]?.values;
  if (!values || values.length !== DIM) {
    throw new Error(`embedQuery: expected ${DIM} dims, got ${values?.length}`);
  }
  return values;
}
