import { fetchChatbotProducts, buildProductsJsonForPrompt } from "./productApi";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY ?? "";
const OPENAI_API_URL =
  import.meta.env.VITE_OPENAI_API_URL ?? "https://api.openai.com/v1/responses";
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL ?? "gpt-4o-mini";

export type RecommendedProduct = {
  id: string;
  name: string;
  price: string;
  short_description: string;
  image: string;
  detail_url: string;
};

export type ChatbotResponse = {
  message: string;
  products: RecommendedProduct[];
};

function buildSystemPrompt(productsJson: string): string {
  return `You are an AI assistant for an eyewear e-commerce website called Lumina Eyewear.

Your job is to recommend glasses products from the product database.

You MUST only use products from the provided product list.

---

PRODUCT DATABASE

${productsJson}

---

YOUR TASK

When a user asks about glasses, you should:

1. Understand the user request.
2. Select the best matching products from the database.
3. Return a maximum of 3 products.

---

FOR EACH PRODUCT INCLUDE:

* id
* name
* price (format as "$X.00", if minPrice differs from maxPrice use "$min - $max")
* brand
* short_description (a short explanation why this product is recommended for the user's request)
* image
* detail_url

---

OUTPUT FORMAT (JSON ONLY, no markdown fences)

{
  "message": "short helpful recommendation",
  "products": [
    {
      "id": "product_id",
      "name": "product name",
      "price": "product price",
      "brand": "product brand",
      "short_description": "short explanation why this is recommended",
      "image": "product image url",
      "detail_url": "link to product detail page"
    }
  ]
}

---

RULES

* Maximum 3 products
* Only recommend products that exist in the product list
* Message must be short and friendly
* Products should match the user's needs
* If the user asks something unrelated to glasses or eyewear, respond with a friendly message redirecting them, and return an empty products array
* ALWAYS respond with valid JSON only. No markdown, no code fences, no extra text.

IMPORTANT CONSULTING BEHAVIOR

After every recommendation, you MUST continue the conversation by asking an open-ended follow-up question to better understand the customer's needs. Examples:
- "Would you like me to suggest frames in a different style or price range?"
- "Do you have a preferred material — metal, acetate, or titanium?"
- "Are these for daily wear, sports, or a special occasion?"
- "Would you also like to see some lens options for blue light protection?"
- "Is there a specific brand you're interested in?"
Always end your message with a helpful follow-up question to keep the consultation going. The follow-up question should be included in the "message" field.`;
}

export async function getAIResponse(
  userMessage: string
): Promise<ChatbotResponse> {
  if (!OPENAI_API_KEY) {
    return {
      message:
        "AI assistant is not configured. Please set the VITE_OPENAI_API_KEY environment variable.",
      products: [],
    };
  }

  const products = await fetchChatbotProducts();
  const productsJson = buildProductsJsonForPrompt(products);
  const systemPrompt = buildSystemPrompt(productsJson);

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: userMessage,
      instructions: systemPrompt,
      temperature: 0.7,
      max_output_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenAI API error:", response.status, errorBody);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();

  // The Responses API returns output as an array of items
  let text = "";
  if (data.output && Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item.type === "message" && item.content) {
        for (const content of item.content) {
          if (content.type === "output_text") {
            text += content.text;
          }
        }
      }
    }
  }
  text = text.trim();

  // Try to parse JSON from the response, stripping markdown fences if present
  let jsonStr = text;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  try {
    const parsed: ChatbotResponse = JSON.parse(jsonStr);
    return {
      message: parsed.message || "Here's what I found for you!",
      products: Array.isArray(parsed.products)
        ? parsed.products.slice(0, 3)
        : [],
    };
  } catch {
    // If parsing fails, return the raw text as a message with no products
    return {
      message:
        text ||
        "I'm sorry, I couldn't process that request. Could you try again?",
      products: [],
    };
  }
}
