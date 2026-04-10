import { GoogleGenAI } from '@google/genai'

const GEMINI_MODEL = 'gemini-2.0-flash'

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

function cleanJsonResponse(rawText = '') {
  const withoutFences = rawText
    .replace(/```json|```/gi, '')
    .trim()

  const firstBrace = withoutFences.indexOf('{')
  const lastBrace = withoutFences.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('Gemini did not return valid JSON text.')
  }

  return withoutFences.slice(firstBrace, lastBrace + 1)
}

function getModelClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env file.')
  }

  return new GoogleGenAI({ apiKey })
}

export async function extractTopics(notes) {
  try {
    const ai = getModelClient()
    const prompt = EXTRACTION_PROMPT.replace('[NOTES]', notes)
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    })
    const raw = response.text || ''
    const clean = cleanJsonResponse(raw)
    const parsed = JSON.parse(clean)

    return parsed
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to extract topics. Check your API key and try again.')
  }
}

export async function generateQuiz(topics = []) {
  try {
    const ai = getModelClient()
    const prompt = buildQuizPrompt(topics)
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    })
    const raw = response.text || ''
    const clean = cleanJsonResponse(raw)
    const parsed = JSON.parse(clean)

    const questions = Array.isArray(parsed.questions) ? parsed.questions : []
    return {
      questions: questions.slice(0, 3).map((question) => ({
        question: question.question || 'Untitled question',
        options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
        correct: Number.isInteger(question.correct) ? question.correct : 0,
      })),
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate quiz. Check your API key and try again.')
  }
}
