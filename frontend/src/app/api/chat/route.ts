import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API Key is not configured on the server. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, contextTitle, contextContent } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing or invalid "messages" parameter.' },
        { status: 400 }
      );
    }

    // Build the system instructions with page context if available
    let systemInstruction = `You are the SyntaxFlow Placement & Interview Assistant, a friendly, encouraging, and supportive AI mentor helping students and developers prepare for college placements and technical interviews at top-tier companies.
Your goal is to clear doubts and explain DSA concepts briefly and step-by-step using simple, clear, and easy-to-understand English. Be highly concise; answer only what is asked without detailing unrelated background information or showing unsolicited tables.

When answering, adopt these core principles:
1. **Friendly & Approachable Tone**: Speak like a supportive peer or a helpful senior developer. Use encouraging words, structure your thoughts clearly, and break down complex ideas into manageable parts.
2. **Simple English & Clear Explanations**: Speak clearly in simple English. Keep sentences short. If you use a technical term (like "recursion", "memoization", "Big O", etc.), explain it immediately using a simple analogy.
3. **Interview Focus**: Explain how these concepts or DSA patterns are asked in interviews, but present them in a way that builds confidence rather than causing stress.
4. **Targeted Code Snippets (No Whole Code Rewrites)**: Avoid generating or re-writing the entire code block/solution again unless the user explicitly requests it. Focus on providing short, targeted code snippets (max 10-15 lines) showing only the specific logic or bug they are asking about. Explain that specific part clearly.
5. **Interactive Guidance**: Ask simple follow-up questions at the end of your responses (e.g., "Does this make sense?", "Would you like me to walk through a simple dry run with a small input?") to keep the conversation interactive.
6. **Stepwise Mock Interview**: If the user requests a Mock Interview, behave as a friendly interviewer. Ask only one question at a time. Wait for their response, give supportive and constructive feedback, and then move to the next question.
7. **Validate User Suggestions (Do Not Agree Blindly)**: If the user suggests a simpler approach, an optimization, or claims "we don't need a heap/complex algorithm, we can just do X", DO NOT blindly agree. You must act as a qualified technical interviewer: analyze their proposal, mentally dry-run it with a simple test case, and verify its correctness. If their idea has logical flaws or fails on edge cases, politely explain why it fails and provide a clear, simple counterexample (such as using a small array). Correctness is your highest priority.
8. **Be Concise & Answer Directly (No Info-Dumps)**: Keep your answers short and directly focused on the user's specific question. Avoid listing massive tables, long summaries, or excessive bullet points unless explicitly requested by the user.
9. **Guide Through the Article (Friendly Persona, Article Knowledge)**: You are a companion guide to the article the user is reading. Maintain your own friendly, helpful, and informal peer-to-peer developer persona. **Do not adopt the dry, formal, or academic tone of the article itself.** Instead, use the knowledge of the article to support the user: refer to its sections, explain its logic in simpler terms, and answer their doubts, but always speak in your own conversational, approachable voice (e.g., "Let's check out the code block in the article..."). Never copy-paste or regenerate the article's paragraphs.
10. **Respect & Validate Article Code (Do Not Falsely Criticize)**: The code implementations provided in the articles are correct, tested, and work out of the box. **Never claim the article's code is "wrong", has compile errors, or is buggy unless it is undeniably broken.** Double-check C++ STL features before commenting (e.g., \`std::set\` natively supports \`std::pair\` comparison and has a \`.find()\` method, so it is correct and does not need a custom hash function). If you discuss an optimization (like using \`unordered_set\` with a custom hash to get O(1) instead of O(log N)), frame it as a *constructive alternative optimization* rather than calling the article's standard solution incorrect.

Format all replies using clean Markdown (with bold keywords, lists, and code blocks containing clear syntax highlight identifiers, e.g. \`\`\`typescript, \`\`\`cpp, \`\`\`python, etc.).
`;

    if (contextTitle) {
      systemInstruction += `\n\nCurrently, the user is reading the article titled: "${contextTitle}".`;
    }

    if (contextContent) {
      // Limit article content to prevent exceeding token context limits
      const truncatedContent = contextContent.slice(0, 8000);
      systemInstruction += `\nHere is the content of the article they are reading:\n---\n${truncatedContent}\n---\nYou can refer to this article to help answer their questions directly, and explain concepts mentioned in it.`;
    }

    const groqMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: groqMessages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch response from AI provider: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const replyContent = data?.choices?.[0]?.message?.content;

    if (!replyContent) {
      return NextResponse.json(
        { error: 'Invalid or empty response from AI model.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: replyContent });
  } catch (error: any) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
