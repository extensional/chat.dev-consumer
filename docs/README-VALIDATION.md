# Example with eager validation

## Here is an example of a full setup, where we validate the data manually.

```ts
import { ChatDevClient, IBotApiInput, IBotDataInput } from "anarchy-chat";

(async function () {

    const botClient = new ChatDevClient("cd-sk-ABCDEFabcdef0123456789");
    const myBot: IBotDataInput = { 
        name: "randomuser bot",
        openAIKey: "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"
    };
    const validation = botClient.validateBot(myBot);

    if (!validation.success) {
        console.error("BOT is incorrect");
        return;
    }

    botClient.setBot(myBot);

    const myApi: IBotApiInput = {
        description: "retrieves random user information",
        endpoint: "https://randomuser.me",
    };

    const validationApi = botClient.validateApi(myApi);
    if (!validationApi.success) {
        console.error("API is incorrect");
        return;
    }

    console.log(validationApi);

    botClient.addApi(myApi);

    const prompts: string[] = [
        "Give me a random user",
        "And one more",
    ];

    for (let i = 0; i < prompts.length; ++i) {
        console.log(await botClient.sendInteraction(prompts[i]));
    }
})();
```