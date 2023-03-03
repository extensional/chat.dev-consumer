import { Observable } from "rxjs";
import { fetcher } from "./fetcher.function";
import { InteractionRequest, InteractionResponse } from "./types/interaction.type";
import { IBotData, ZodValidator, ZodValidationResult, createZodErrorObject, BotData, IBotApi, BotApi } from "chat.dev-config";

export class ChatDevClient {

    private bot!: IBotData;
    // private prompt!: string;
    // private interactions!: any[];

    private apiKey: string;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("you can find the key on https://chat.dev")
        }
        this.apiKey = apiKey;
    }

    public setBot = (bot: IBotData) => {
        if (!this.validateBot(bot).success) {
            throw new Error("bot is invalid. please validate the bot first");
        }
        this.bot = bot;
    }

    private validateGeneric = <T extends Record<string, any>>(
        object: T,
        validationClass: ZodValidator<any>
    ): ZodValidationResult<T> => {
        const validation = validationClass.safeParse(object);
        if (validation.success) {
            return { success: true, errors: {} };
        } else {
            return { success: false, errors: createZodErrorObject(validation.error.issues) }
        }
    }

    public validateBot = (bot: IBotData): ZodValidationResult<IBotData> => {
        return this.validateGeneric<IBotData>(bot, BotData);
    }

    public validateApi = (botApi: IBotApi): ZodValidationResult<IBotApi> => {
        return this.validateGeneric<IBotApi>(botApi, BotApi);
    }

    public sendInteraction = (prompt: string): Observable<InteractionResponse[]> => {
        if (!this.bot) {
            throw new Error("please set a bot first");
        }

        return fetcher<InteractionResponse[], InteractionRequest>(
            this.apiKey,
            "POST",
            "/consumer/interactions",
            { interaction: prompt, bot: this.bot }
        )
    }
}