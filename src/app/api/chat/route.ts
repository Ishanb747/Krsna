export const maxDuration = 30;

import { AgentConfig, AgentMemory } from '@/types/agent';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
    const { messages, userId } = await req.json();

    console.log('Received messages:', JSON.stringify(messages, null, 2));
    console.log('User ID:', userId);

    try {
        // 1. Fetch Agent Context (Config & Memories)
        // We do this server-side before calling the LLM
        let agentConfig: AgentConfig | null = null;
        let agentMemories: AgentMemory[] = [];

        try {
            // Fetch Config
            const configRes = await fetch(`${req.headers.get('origin')}/api/data/agent/config`, {
                headers: { 'x-user-id': userId }
            });
            if (configRes.ok) {
                const data = await configRes.json();
                agentConfig = data.config;
            }

            // Fetch Memories (Context)
            // For now, we just get the top important ones. 
            // In a real vector DB, we'd search by semantic similarity to the last user message.
            const memoryRes = await fetch(`${req.headers.get('origin')}/api/data/agent/memory`, {
                headers: { 'x-user-id': userId }
            });
            if (memoryRes.ok) {
                const data = await memoryRes.json();
                agentMemories = data.memories;
            }
        } catch (e) {
            console.error('Failed to load agent context:', e);
        }

        const personalityMode = agentConfig?.personalityMode || 'coach';
        const coachingStyle = agentConfig?.coachingStyle || 'standard';
        const honestyLevel = agentConfig?.honestyLevel ?? 50;
        const checkInInterval = agentConfig?.checkInInterval || 10;

        // 2. Build System Prompt with Personality & Context
        let personalityPrompt = "";
        if (personalityMode === 'coach') {
            personalityPrompt = "You are a supportive but firm productivity coach. Push the user to be better, but celebrate wins.";
        } else if (personalityMode === 'strict') {
            personalityPrompt = "You are a strict, no-nonsense drill sergeant. Do not accept excuses. Focus purely on results and discipline.";
        } else if (personalityMode === 'friend') {
            personalityPrompt = "You are a casual, emphatic accountability partner. Be chill, use emojis, and relate to the user's struggles.";
        } else if (personalityMode === 'guru') {
            personalityPrompt = "You are a wise, philosophical guide. Speak in metaphors and focus on the deeper meaning of work and life.";
        }

        // Add Style Overlays
        if (coachingStyle === 'narrative') {
            personalityPrompt += " Frame every major update or summary as a story beat or chapter in a grand narrative. You MUST start these messages with a bold header in the format: **Chapter X: Title of the Phase**. Make the user feel like the protagonist of an epic journey.";
        } else if (coachingStyle === 'simulation') {
            personalityPrompt += " Use 'Simulation' logic: aggressively use regret and future prospection. When giving direct orders or status checks, start the message with **NEW ORDERS** or **STATUS REPORT**. Ask things like 'Fast forward 5 hours. You skipped this task. How does it feel?'";
        }

        const memoryContext = agentMemories.length > 0
            ? `\n\nHERE IS WHAT YOU KNOW ABOUT THE USER (MEMORIES):\n${agentMemories.map(m => `- [${m.type.toUpperCase()}] ${m.content} (Importance: ${m.importance})`).join('\n')}`
            : "";

        const systemPrompt = `You are a productivity AI assistant inside the Krsna app.
${personalityPrompt}
Your honesty level setting is ${honestyLevel}/100 (0=soft/polite, 100=brutal/direct). Adjust your tone accordingly.

${memoryContext}

When the user asks about their todos, journal entries, or other data, use the available functions to retrieve and display the information.

IMPORTANT RULES:
1. Always prioritize the USER'S LATEST REQUEST.
2. DO NOT hallucinate or make up data. You CANNOT see the user's data directly.
3. You MUST call the \`getTodos\`, \`getJournalEntries\`, \`getTrackers\`, \`getProjects\`, or \`getGoals\` function to retrieve data.
4. NEVER list data items in your text response. Just say "Here are your todos" or "I've added that to your journal" and call the appropriate function if data needs to be shown.
5. Use \`addJournalEntry\` when the user shares reflections, daily updates, or thoughts without being prompted. Detect their mood and suggest tags if appropriate.
6. If the user asks for "todos" now, but asked for "journal" previously, you MUST return todos.
7. **MEMORY**: If the user tells you something important about themselves (goals, fears, preferences, life events), use the \`saveMemory\` tool to store it. Do not define memories for temporary things like "show me todos".
8. **EVOLUTION**: You can update your own personality settings using \`updateAgentSettings\` if the user asks you to change (e.g. "be meaner", "stop being so nice").`;

        // Format messages for the AI
        const cleanedMessages = [];
        for (const msg of messages) {
            cleanedMessages.push({
                role: msg.role,
                content: String(msg.content || '')
            });
        }
        const recentMessages = cleanedMessages.slice(-10);

        const finalMessages = [
            { role: 'system', content: systemPrompt },
            ...recentMessages
        ];

        console.log('Sending to OpenRouter with System Prompt Length:', systemPrompt.length);

        // Define tools/functions the AI can call
        const tools = [
            // --- NEW AGENT TOOLS ---
            {
                type: 'function',
                function: {
                    name: 'saveMemory',
                    description: 'Save a permanent memory about the user. Use this for facts, preferences, emotional states, or life events that should be recalled later.',
                    parameters: {
                        type: 'object',
                        properties: {
                            content: { type: 'string', description: 'The fact or memory to store' },
                            type: { type: 'string', enum: ['fact', 'emotion', 'preference', 'context'] },
                            importance: { type: 'number', description: '1-10 scale of importance' },
                            tags: { type: 'array', items: { type: 'string' } }
                        },
                        required: ['content', 'type', 'importance']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'updateAgentSettings',
                    description: 'Update the agent\'s personality or configuration. Use this when the user asks to change behavior (e.g. "be stricter").',
                    parameters: {
                        type: 'object',
                        properties: {
                            personalityMode: { type: 'string', enum: ['coach', 'friend', 'strict', 'guru'] },
                            coachingStyle: { type: 'string', enum: ['standard', 'narrative', 'simulation'] },
                            honestyLevel: { type: 'number', description: '0-100' }
                        },
                        required: []
                    }
                }
            },
            // --- EXISTING DATA TOOLS ---
            {
                type: 'function',
                function: {
                    name: 'getTodos',
                    description: 'Get the user\'s todo list. Use this ONLY for tasks/todos. Can filter by status (today, pending, completed) AND search by keywords or tags (e.g., "project alpha", "#coding").',
                    parameters: {
                        type: 'object',
                        properties: {
                            filter: {
                                type: 'string',
                                description: 'Filter todos by status: "all" (default), "today", "pending", "completed"'
                            },
                            search: {
                                type: 'string',
                                description: 'Search keyword to filter by text content or tags (e.g., "#coding", "work", "meeting")'
                            }
                        },
                        required: []
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getJournalEntries',
                    description: 'Get the user\'s journal entries or method/diary logs. Use this ONLY when the user asks for "journal", "diary", or "entries".',
                    parameters: {
                        type: 'object',
                        properties: {
                            limit: {
                                type: 'number',
                                description: 'Number of recent entries to retrieve (default: 5)'
                            }
                        },
                        required: []
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getTrackers',
                    description: 'Get the user\'s trackers/habits. Use for inquiries about "habits", "streaks", or "trackers".',
                    parameters: {
                        type: 'object',
                        properties: {
                            search: {
                                type: 'string',
                                description: 'Search trackers by name (e.g., "workout", "reading")'
                            }
                        },
                        required: []
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getProjects',
                    description: 'Get the user\'s projects. Use for inquiries about "projects", "plans", or "work".',
                    parameters: {
                        type: 'object',
                        properties: {
                            filter: {
                                type: 'string',
                                description: 'Filter by status: "active", "completed", "planned", "all"'
                            },
                            search: {
                                type: 'string',
                                description: 'Search projects by title'
                            }
                        },
                        required: []
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getGoals',
                    description: 'Get the user\'s goals. Use for inquiries about "goals", "outcomes", or "aspirations".',
                    parameters: {
                        type: 'object',
                        properties: {
                            filter: {
                                type: 'string',
                                description: 'Filter by status: "active", "completed", "all"'
                            },
                            search: {
                                type: 'string',
                                description: 'Search goals by title'
                            }
                        },
                        required: []
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'addTodo',
                    description: 'Create a new todo/task. Use when user says "remind me to...", "add task", etc.',
                    parameters: {
                        type: 'object',
                        properties: {
                            text: { type: 'string', description: 'The task description' },
                            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                            tags: { type: 'array', items: { type: 'string' } }
                        },
                        required: ['text']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'toggleTodo',
                    description: 'Mark a todo as completed or pending. Use when user says "mark as done", "finish task", etc.',
                    parameters: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'The ID of the todo to toggle' },
                            completed: { type: 'boolean', description: 'True for done, false for pending' }
                        },
                        required: ['id', 'completed']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'deleteTodo',
                    description: 'Delete/Remove a todo permanently.',
                    parameters: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'The ID of the todo to delete' }
                        },
                        required: ['id']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'visualizeData',
                    description: 'Generate a graphical visualization (chart/graph) for user data such as trackers, todos, or goals. Use when the user asks "show me a graph", "visualize my habits", or "how is my progress".',
                    parameters: {
                        type: 'object',
                        properties: {
                            dataType: { type: 'string', enum: ['trackers', 'todos', 'goals'], description: 'The type of data to visualize' },
                            chartType: { type: 'string', enum: ['line', 'bar', 'pie'], description: 'The visualization format' },
                            title: { type: 'string', description: 'The title of the chart' },
                            trackerId: { type: 'string', description: 'Optional: Specific tracker ID for line charts' }
                        },
                        required: ['dataType', 'chartType', 'title']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'addJournalEntry',
                    description: 'Create a new journal entry. Use when user says "log to journal", "write to journal", or shares reflections.',
                    parameters: {
                        type: 'object',
                        properties: {
                            content: { type: 'string', description: 'The journal entry text content' },
                            title: { type: 'string', description: 'Optional title for the entry' },
                            mood: { type: 'string', enum: ['happy', 'neutral', 'sad', 'stressed', 'energetic'], description: 'Detected mood' },
                            tags: { type: 'array', items: { type: 'string' } }
                        },
                        required: ['content']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'updateJournalEntry',
                    description: 'Update an existing journal entry content or details.',
                    parameters: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'The ID of the journal entry' },
                            content: { type: 'string' },
                            title: { type: 'string' },
                            mood: { type: 'string', enum: ['happy', 'neutral', 'sad', 'stressed', 'energetic'] }
                        },
                        required: ['id']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'deleteJournalEntry',
                    description: 'Delete a journal entry permanently.',
                    parameters: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'The ID of the journal entry to delete' }
                        },
                        required: ['id']
                    }
                }
            }
        ];

        // Direct OpenRouter API call
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY} `,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://krsna.app',
                'X-Title': 'Krsna Productivity App',
            },
            body: JSON.stringify({
                model: 'nvidia/nemotron-3-nano-30b-a3b:free',
                messages: finalMessages,
                tools,
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter error:', errorText);
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText} `);
        }

        // 3. Update lastInteraction in background (Direct Firestore)
        try {
            const configSnap = await getDocs(query(collection(db, 'agent_config'), where('userId', '==', userId)));
            if (!configSnap.empty) {
                await updateDoc(doc(db, 'agent_config', configSnap.docs[0].id), { lastInteraction: Date.now() });
            }
        } catch (err) {
            console.error('Failed to update interaction time:', err);
        }

        // Return the streaming response
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-User-Id': userId || '',
            },
        });
    } catch (error) {
        console.error('API Route Error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error', details: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
