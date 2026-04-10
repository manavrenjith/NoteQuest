import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_MODEL = 'gemini-1.5-flash'
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const EXTRACTION_PROMPT = `You are an expert educator. Analyze the following student notes and extract a structured syllabus.

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
[NOTES]`

function buildQuizPrompt(topics) {
  const topicList = topics
    .map((topic, index) => `${index + 1}. ${topic.title}: ${topic.description || 'No description provided'}`)
    .join('\n')

  return `Based on these topics: ${topicList}
Generate exactly 3 multiple choice questions to test understanding.

Return ONLY valid JSON, no markdown, no backticks:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }
  ]
}`
}

function cleanJsonResponse(rawText) {
  const withoutFences = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim()

  const firstBrace = withoutFences.indexOf('{')
  const lastBrace = withoutFences.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('Gemini did not return valid JSON text.')
  }

  return withoutFences.slice(firstBrace, lastBrace + 1)
}

export async function extractTopics(notes) {
  if (!API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env file.')
  }

  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
  const prompt = EXTRACTION_PROMPT.replace('[NOTES]', notes)

  const result = await model.generateContent(prompt)
  const rawText = result.response.text()
  const cleaned = cleanJsonResponse(rawText)

  return JSON.parse(cleaned)
}

export async function generateQuiz(topics = []) {
  if (!API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env file.')
  }

  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
  const prompt = buildQuizPrompt(topics)

  const result = await model.generateContent(prompt)
  const rawText = result.response.text()
  const cleaned = cleanJsonResponse(rawText)
  const parsed = JSON.parse(cleaned)

  const questions = Array.isArray(parsed.questions) ? parsed.questions : []
  return {
    questions: questions.slice(0, 3).map((question) => ({
      question: question.question || 'Untitled question',
      options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
      correct: Number.isInteger(question.correct) ? question.correct : 0,
    })),
  }
}
