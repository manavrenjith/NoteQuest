import Groq from "groq-sdk";

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function extractTopics(notes) {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `You are an expert educator. Analyze the following student notes and extract a structured syllabus.

Return ONLY a valid JSON object with no extra text, no markdown, no backticks. Use this exact format:
{
  "subject": "detected subject name",
  "chapters": [
    {
      "id": "chapter_1",
      "title": "Chapter name",
      "topics": [
        {
          "id": "topic_1_1",
          "title": "Topic title",
          "description": "One line summary of this topic",
          "completed": false
        }
      ]
    }
  ]
}

Student Notes:
${notes}`
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const raw = response.choices[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed;

  } catch (error) {
    if (error.message?.includes("429")) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    if (error.message?.includes("401")) {
      throw new Error("Invalid API key. Please check your .env file.");
    }
    console.error("Groq API error:", error);
    throw new Error("Failed to extract topics. Please try again.");
  }
}

export async function generateQuiz(topics) {
  const topicLines = (Array.isArray(topics) ? topics : [])
    .map((topic, index) => `${index + 1}. ${topic?.title || 'Untitled topic'}: ${topic?.description || ''}`)
    .join('\n')

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Create a short multiple choice quiz from these study topics.

Return ONLY a valid JSON object with no markdown, no comments, no extra text.
Use this exact schema:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct": 0
    }
  ]
}

Rules:
- Generate exactly 5 questions.
- Each question must have exactly 4 options.
- "correct" must be a zero-based option index from 0 to 3.
- Keep language clear and concise.

Topics:
${topicLines}`
        }
      ],
      temperature: 0.4,
      max_tokens: 4000,
    })

    const raw = response.choices[0]?.message?.content || ""
    const clean = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(clean)

    const safeQuestions = Array.isArray(parsed?.questions)
      ? parsed.questions
          .map((item) => ({
            question: String(item?.question || '').trim(),
            options: Array.isArray(item?.options)
              ? item.options.slice(0, 4).map((option) => String(option || '').trim())
              : [],
            correct: Number.isInteger(item?.correct) ? item.correct : -1,
          }))
          .filter(
            (item) =>
              item.question.length > 0 &&
              item.options.length === 4 &&
              item.options.every((option) => option.length > 0) &&
              item.correct >= 0 &&
              item.correct <= 3,
          )
      : []

    return { questions: safeQuestions }
  } catch (error) {
    if (error.message?.includes("429")) {
      throw new Error("Too many requests. Please wait a moment and try again.")
    }
    if (error.message?.includes("401")) {
      throw new Error("Invalid API key. Please check your .env file.")
    }
    console.error("Groq API error:", error)
    throw new Error("Failed to generate quiz. Please try again.")
  }
}

export async function getStudyTip(topicTitle, topicDescription) {
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Give exactly ONE concise study tip (max 15 words) for learning this topic:
Topic: "${topicTitle}"
Description: "${topicDescription}"

Return ONLY the tip text. No quotes, no bullet points, no extra text.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    })

    return response.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    if (error.message?.includes('429')) {
      throw new Error('Too many requests. Please wait a moment and try again.')
    }
    if (error.message?.includes('401')) {
      throw new Error('Invalid API key. Please check your .env file.')
    }
    console.error('Groq API error:', error)
    throw new Error('Failed to fetch study tip. Please try again.')
  }
}
