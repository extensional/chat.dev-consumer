# Example without validation

## Here is an example of a full setup, where we _know_ the data is valid, and thus we don't validate it.

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
                params: [
                    {name: "from", value: "the place from where we leave", isValue: false},
                    {name: "to", value: "the place we go to", isValue: false},
                ],
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