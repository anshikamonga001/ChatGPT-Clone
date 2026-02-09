import "dotenv/config";
import fetch from "node-fetch"; // required if Node < 18

const getGROQAPIResponse = async (message) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: message }
      ],
    }),
  };

  try {
    const response = await fetch(
      "https://api.groq.ai/v1/chat/completions",
      options
    );

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
      throw new Error("No choices returned from Groq");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("GROQ API error:", error);
    return "Error generating response";
  }
};

export default getGROQAPIResponse;
