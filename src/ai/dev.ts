import { config } from 'dotenv';
config();

import '@/ai/flows/search-recent-events.ts';
import '@/ai/flows/generate-product-description.ts';
import '@/ai/flows/store-assistant-flow.ts'; // Added store assistant flow
import '@/ai/flows/analyze-feedback.ts';
import '@/ai/flows/analyze-conversations.ts'; // Added conversation analysis flow
import '@/ai/flows/enhance-chatbot-prompt.ts';
