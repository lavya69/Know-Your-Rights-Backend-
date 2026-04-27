const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const getAIResponse = async (message) => {
  // ✅ AI PROMPT (AS REQUESTED)
  const prompt = `
You are a legal awareness assistant for Indian citizens.

Rules:
- Identify the situation clearly
- Mention relevant rights
- Mention applicable Indian laws (simple language)
- Suggest practical next steps
- Do NOT give legal advice
- Keep the response simple and easy to understand
- Add a short disclaimer at the end

Format strictly like this:

Situation:
Rights:
Law:
Actions:
Disclaimer:

User input: ${message}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    // ✅ HANDLE API FAILURE
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error("Gemini API failed");
    }

    const rawText = await response.text();

    // ✅ HANDLE EMPTY RESPONSE
    if (!rawText) {
      throw new Error("Empty response from Gemini");
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("Invalid JSON:", rawText);
      throw new Error("Invalid JSON from Gemini");
    }

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!output) {
      throw new Error("No text returned by Gemini");
    }

    return output;

  } catch (err) {
    console.error("❌ ERROR in getAIResponse:", err.message);

    // ✅ FALLBACK (prevents backend crash)
    return "⚠️ The AI service is currently busy. Please try again in a moment.";
  }
};

module.exports = { getAIResponse };