import { BotApi, BotData, BotDataParameter, DEBUG_LEVEL, DebugLevelType, IBotApi, IBotData, IBotDataModel, IBotDataParameter, IInteractionConsumerPrompt, IInteractionConsumerRequest, IInteractionConsumerResponse, ZodValidationResult, ZodValidator, createZodErrorObject } from "chat.dev-config";
import { Observable, tap } from "rxjs";
import { clientErrors, config } from "./config";
import { fetcher } from "./fetcher.function";

type ExtraArgsType = any | {
    baseUrl?: string; // for debugging purposes
}

export class Client {

    private bot!: IBotData;

    private botModel!: IBotDataModel;

    private interactions: IInteractionConsumerPrompt[] = [];

    private static apiKey: string;

    private static baseUrl: string = config.baseUrl;

    constructor(apiKey: string, debugLevel: DebugLevelType = DEBUG_LEVEL.NO, extra: ExtraArgsType = {}) {
        if (!apiKey) {
            throw new Error(clientErrors.invalidKey)
        }
        if (extra.baseUrl) {
            Client.baseUrl = extra.baseUrl;
        }
    }

    public setBot = (bot: IBotData): ZodValidationResult<IBotData> => {
        const validation: ZodValidationResult<IBotData> = this.validateBot(bot);
        if (validation.success) {
            this.bot = bot;
        }
        return validation;
    }

    public getBot = (): IBotData => {
        this.verifyHasBot();
        return this.bot;
    }

    public getPromptHistory = (): IInteractionConsumerPrompt[] => this.interactions;

    public fetchBot = (botSecret: IBotDataModel["secret"]): Observable<IBotDataModel> => {
        return fetcher<IBotDataModel>(
            { apiKey: Client.apiKey, baseUrl: Client.baseUrl },
            "GET",
            `/bots/${botSecret}`,
        )
            .pipe(
                tap((b: IBotDataModel) => {
                    this.botModel = b;
                    this.bot = b;
                })
            )
    }

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

    public validateBot = (bot: IBotData): ZodValidationResult<IBotData> => {
        return this.validateGeneric<IBotData>(bot, BotData);
    }

    public validateApi = (botApi: IBotApi): ZodValidationResult<IBotApi> => {
        return this.validateGeneric<IBotApi>(botApi, BotApi);
    }

    public validateParam = (botParam: IBotDataParameter): ZodValidationResult<IBotDataParameter> => {
        return this.validateGeneric<IBotDataParameter>(botParam, BotDataParameter);
    }

    public sendInteraction = (promptQuery: string): Observable<IInteractionConsumerResponse> => {
        this.verifyHasBot();

        return fetcher<IInteractionConsumerResponse, IInteractionConsumerRequest>(
            { apiKey: Client.apiKey, baseUrl: Client.baseUrl },
            "POST",
            "/consumer/interactions",
            { question: promptQuery, bot: this.bot, history: this.interactions }
        )
            .pipe(
                tap((response: IInteractionConsumerResponse) => {
                    this.interactions = response.history;
                })
            )
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
