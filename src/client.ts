import { BotApi, BotData, BotDataParameter, DEBUG_LEVEL, DebugLevelType, IBotApi, IBotData, IBotDataModel, IBotDataParameter, IInteractionConsumerPrompt, IInteractionConsumerRequest, IInteractionConsumerResponse, ZodValidationResult, ZodValidator, createZodErrorObject } from "chat.dev-config";
import { clientErrors, config } from "./config";
import { fetcher } from "./fetcher.function";

type ExtraArgsType = any | {
    debugUrl?: string; // for debugging purposes
}

export class Client {

    private bot!: IBotData;

    private botModel!: IBotDataModel;

    private interactions: IInteractionConsumerPrompt[] = [];

    private static apiKey: string;

    private static baseUrl: string = config.baseUrl;

    /**
     * Create a new instance. The apiKey is mandatory unless you have called {@see init} before.
     * @param apiKey string
     * @param debugLevel DebugLevelType
     */
    constructor(apiKey: string = Client.apiKey, debugLevel: DebugLevelType = DEBUG_LEVEL.NO, extra: ExtraArgsType = {}) {
        if (apiKey) {
            Client.apiKey = apiKey;
        }
        if (!apiKey) {
            throw new Error(clientErrors.invalidKey)
        }
        
        if (extra.debugUrl) {
            Client.baseUrl = extra.debugUrl;
        }
    }

    /**
     * Instead of passing an apiKey to each <code>new Client("MY_KEY")</code> you can call {@see init} once
     * @param apiKey string
     */
    public static init = (apiKey: string): void => {
        Client.apiKey = apiKey;
    }

    /**
     * Sets the bot into the instance
     * @param IBotData
     * @returns 
     */
    public setBot = (bot: IBotData): ZodValidationResult<IBotData> => {
        const validation: ZodValidationResult<IBotData> = this.validateBot(bot);
        if (validation.success) {
            this.bot = bot;
            this.interactions = [];
        }
        return validation;
    }

    /**
     * Retrieves the bot instance
     * @returns IBotData
     */
    public getBot = (): IBotData => {
        this.verifyHasBot();
        return this.bot;
    }

    /**
     * Retrieves the history of interactions with the last bot.
     * @returns IInteractionConsumerPrompt[]
     */
    public getPromptHistory = (): IInteractionConsumerPrompt[] => this.interactions;

    /**
     * If you know the botSecret, you can fetch it from the server.
     * @param botSecret string
     * @returns Promise<IBotDataModel>
     */
    public fetchBot = (botSecret: IBotDataModel["secret"]): Promise<IBotDataModel> => {
        return fetcher<IBotDataModel>(
            { apiKey: Client.apiKey, baseUrl: Client.baseUrl },
            "GET",
            `/bots/${botSecret}`,
        )
            .then((b: IBotDataModel) => {
                this.botModel = b;
                this.bot = b;
                return b;
            });
    }

    /**
     * If you didn't set all the apis when you called {@see setBot}, you can add them one by one here
     * @param api IBotApi
     * @returns ZodValidationResult<IBotApi>
     */
    public addApi = (api: IBotApi): ZodValidationResult<IBotApi> => {
        this.verifyHasBot();

        if (
            this.bot.apis.find((_api: IBotApi) =>
                api.endpoint === _api.endpoint &&
                api.method === _api.method)
        ) {
            return { success: false, message: clientErrors.apiAdded, errors: {} };
        }

        const validation: ZodValidationResult<IBotApi> = this.validateApi(api);
        if (validation.success) {
            this.bot.apis.push(api);
        }
        return validation;
    }

    /**
     * Validates that the given bot is valid
     * @param bot IBotData
     * @returns ZodValidationResult<IBotData>
    */
   public validateBot = (bot: IBotData): ZodValidationResult<IBotData> => {
       return this.validateGeneric<IBotData>(bot, BotData);
    }
    
    /**
     * Validates that the given api is valid
     * @param bot IBotApi
     * @returns ZodValidationResult<IBotApi>
     */
    public validateApi = (botApi: IBotApi): ZodValidationResult<IBotApi> => {
        return this.validateGeneric<IBotApi>(botApi, BotApi);
    }
    
    /**
     * Validates that the given param is valid
     * @param bot IBotDataParameter
     * @returns ZodValidationResult<IBotDataParameter>
     */
    public validateParam = (botParam: IBotDataParameter): ZodValidationResult<IBotDataParameter> => {
        return this.validateGeneric<IBotDataParameter>(botParam, BotDataParameter);
    }

    /**
     * Sends a query prompt to the server and returns the response.
     * @param promptQuery string
     * @returns Promise<IInteractionConsumerResponse>
     */
    public sendInteraction = (promptQuery: string): Promise<IInteractionConsumerResponse> => {
        this.verifyHasBot();

        return fetcher<IInteractionConsumerResponse, IInteractionConsumerRequest>(
            { apiKey: Client.apiKey, baseUrl: Client.baseUrl },
            "POST",
            "/consumer/interactions",
            { question: promptQuery, bot: this.bot, history: this.interactions }
        )
            .then((response: IInteractionConsumerResponse) => {
                this.interactions = response.history;
                return response;
            });
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

    private verifyHasBot = (): void => {
        if (this.bot || this.botModel) {
            // ok
        } else {
            throw new Error(clientErrors.mustSetBot);
        }
    }
}
