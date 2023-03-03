import { BotApi, BotData, BotDataParameter, IBotApi, IBotData, IBotDataModel, IBotDataParameter, ZodValidationResult, ZodValidator, createZodErrorObject } from "chat.dev-config";
import { Observable, tap } from "rxjs";
import { clientErrors } from "./config";
import { fetcher } from "./fetcher.function";
import { InteractionRequest, InteractionResponse } from "./types/interaction.type";

export class Client {

    private bot!: IBotData;

    private botModel!: IBotDataModel;

    private static apiKey: string;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error(clientErrors.invalidKey)
        }
    }

    public setBot = (bot: IBotData): ZodValidationResult<IBotData> => {
        const validation: ZodValidationResult<IBotData> = this.validateBot(bot);
        if (validation.success) {
            this.bot = bot;
        }
        return validation;
    }

    public fetchBot = (botSecret: IBotDataModel["secret"]): Observable<IBotDataModel> => {
        return fetcher<IBotDataModel>(
            Client.apiKey,
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
            throw new Error(clientErrors.apiAdded);
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

    public sendInteraction = (prompt: string): Observable<InteractionResponse[]> => {
        this.verifyHasBot();

        return fetcher<InteractionResponse[], InteractionRequest>(
            Client.apiKey,
            "POST",
            "/consumer/interactions",
            { interaction: prompt, bot: this.bot }
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
