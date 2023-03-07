```ts
import { ChatDevClient } from "chat.dev-consumer";

(async function () {

    const botClient = new ChatDevClient("cd-sk-ABCDEFabcdef0123456789");
    botClient.setBot({
        name: "distance bot",
        openAIKey: "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",
        apis: [
            {
                description: "retrieves distance and weather information between places",
                method: "GET",
                endpoint: "https://distance-calculator.example.com",
                params: [],
                jsonBody: [],
                dataBody: [],
                headers: [],
                authorization: [],
                cert: "",
            }
        ],
    });


    const prompts: string[] = [
        "What is the distance from New York to Boston?",
        "And to Philadelphia?",
        "What is the temperature there?"
    ];

    for (let i = 0; i < prompts.length; ++i) {
        console.log(await botClient.sendInteraction(prompts[i]));
    }

})();
```