import { IBotData } from "chat.dev-config";

export interface InteractionRequest {
    interaction: string;
    bot: IBotData;
}

export interface InteractionResponse {
    question: string;
    answer: string;
    timestamp: string;
    debug_info: string;
}