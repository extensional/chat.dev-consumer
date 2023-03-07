# Installation and usage

[https://www.npmjs.com/package/anarchy-chat](https://www.npmjs.com/package/anarchy-chat)

### A Promise-based Typescript-first consumer for [https://chat.dev](https://chat.dev)

The Consumer `ChatDevClient` is a javascript, promise-based, Typescript-first class that simplifies the creation, validation and interaction of your code with out chat.dev API.

***

## Installation

To install, run

```js
npm install anarchy-chat
```

## Configuration

You can retrieve a key for the consumer at [https://chat.dev/settings](https://chat.dev/settings).\
These keys start with `cd-sk-*****`.

Create a new instance in your code in one of the following two ways:

1.  Set the key only once and reuse it (at a module level):

    ```ts
    import { ChatDevClient } from "@-anarchy-/chat";

    ChatDevClient.init("MY_SECRET_KEY"); // the key is set "globally"
    const client1 = new ChatDevClient(); // will use MY_SECRET_KEY
    const client2 = new ChatDevClient(); // will use MY_SECRET_KEY
    ```
2.  Set the key once per instance

    ```ts
    import { ChatDevClient } from "@-anarchy-/chat";

    const client1 = new ChatDevClient("MY_SECRET_KEY"); // will use MY_SECRET_KEY
    const client2 = new ChatDevClient(); // throws error!
    ```

## Usage

To start, you must create a bot and pass it to the client. The bot is structured like `IBotData`, which can be imported from the consumer:

*   Bot with APIs

    ```ts
    import { IBotData } from "@-anarchy-/chat";
    // A bot with APIs
    const bot: IBotData = {
            name: "my-bot",
            openAIKey: "sk-MY_OPENAI_API_KEY",
            apis: [
                {
                    description: "this api gets examples from the internet", // required for the bot to understand when to use this api!
                    method: "GET",
                    endpoint: "https://api.example.com/v1",
                    params: [
                        {name: "userId", value: "the ID of the user", isValue: false}, // description
                        {name: "type", value: "inactive", isValue: true} // value
                    ],
                    jsonBody: [],
                    dataBody: [],
                    headers: [],
                    authorization: [],
                    cert: "",
                }
            ],
        };
    ```
*   Bot without APIs

    ```ts
    import { IBotData } from "@-anarchy-/chat";
    // A bot without APIs. They can be added later
    const bot: IBotData = {
            name: "my-bot",
            openAIKey: "sk-MY_OPENAI_API_KEY",
            apis: [],
        };
    ```

Now the bot can be added to the client:

```ts
import { ChatDevClient, IBotData } from "@-anarchy-/chat";

const client = new ChatDevClient("MY_SECRET_KEY");
client.setBot(bot);
```

You can still add APIs to it after that:

```ts
import { ChatDevClient, IBotApi } from "@-anarchy-/chat";

const client = new ChatDevClient("MY_SECRET_KEY");
client.setBot(bot);

const api: IBotApi = {
    description: "calculates the number of kittens in a given location",
    method: "GET",
    endpoint: "https://api.example.com/kitten-calculator",
    params: [
        {name: "place_name", value: "the place where we want to find the quantity of kittens", isValue: false}, // description
        {name: "distance_from_place_name", value: "20km", isValue: true} // value
    ],
    jsonBody: [],
    dataBody: [],
    headers: [],
    authorization: [],
    cert: ""
};

client.setApi(api);
client.setApi(api); // can't be added twice -> the validation will indicate why.
```

If the API has been added already, an error will be thrown.

The `bot` and `api` will be validated when calling their respective `setBot()` and `setApi()` functions. If they are invalid, an error object will be returned.

## Validation

### Cautious validation

To avoid unexpected issues, we can validate the data before passing it to our client:

```ts
import { ChatDevClient, IBotApi, IBotData, ZodValidationResult } from "@-anarchy-/chat";

const client = new ChatDevClient("MY_SECRET_KEY");
const bot: IBotData = { ... }
const validateBot: ZodValidationResult<IBotData> = client.validateBot(bot);

if (!validateBot.success) {
    // handle the error
    console.log(validateBot.errors);
} else {
    // bot is valid, and can be added to client!
    client.setBot(bot);
}

const api: IBotApi = { ... };

const validateApi: ZodValidationResult<IBotApi> = client.validateApi(api);

if (!validateApi.success) {
    // handle the error
    console.log(validateApi.errors);
} else {
    // api is valid, and can be added to the bot!
    client.setApi(api);
}

client.setApi(api);
```

### In-time validation

The data is also validated when we set a Bot or add an API:

```ts
import { ChatDevClient, IBotApi, IBotData, ZodValidationResult } from "@-anarchy-/chat";

const client = new ChatDevClient("MY_SECRET_KEY");
const bot: IBotData = { ... }

const botAdded: ZodValidationResult<IBotData> = client.setBot(bot);

if (!botAdded.success) {
    // handle the error
    console.log(validateBot.errors);
} else {
    // bot is valid, and HAS BEEN added to client!
}
```

## Interaction

Once a bot has been set, and we are happy with its data (check `client.getBot()` if you want to retrieve its value) we can start sending requests

```ts
import { ChatDevClient, IBotApi, IBotData, ZodValidationResult, IInteractionConsumerResponse } from "@-anarchy-/chat";

const client = new ChatDevClient("MY_SECRET_KEY");
client.setBot({ ... });

// Send an interaction - wrap in an async function!
const response: IInteractionConsumerResponse = 
    await client.sendInteraction("How many kittens are there in New York City?");

// Use the result
console.log(
    response.prompt.question,
    response.prompt.answer,
    response.prompt.privateDebugInfo
);

// Send another interaction:
const followupResponse: IInteractionConsumerResponse = 
    await client.sendInteraction("What about in San Francisco?");

// Use the result
console.log(followupResponse.prompt.answer);
```

## Notes

The interaction history (i.e. the list of previous question/answer pairs) is automatically handled by the client. You don't have to do anything about it. If we want to retrieve the history, the function `sendInteraction("...")`, which returns type `Promise<IInteractionConsumerResponse>` will contain the history under: `IInteractionConsumerResponse["history"]`.

## Functions

| Function name             |                                                                                      | given type               | return type                               | example argument                                                                             |
|---------------------------|--------------------------------------------------------------------------------------|--------------------------|-------------------------------------------|----------------------------------------------------------------------------------------------|
| `static init(KEY)`        | sets the key globally for all instances                                              | `string`                 |                                           |                                                                                              |
| `setBot(bot)`             | If valid, sets the Bot in the client. If invalid, returns the Bot's errors.          | `IBotDataInput`          | `ZodValidationResult <IBotData>`          | `{name: "", openAIKey: "sk-...", apis: []}`                                                  |
| `validateBot(bot)`        | Validates a given Bot. No side effects                                               | `IBotDataInput`          | `ZodValidationResult <IBotData>`          | `{name: "", openAIKey: "sk-..."}`                                                            |
| `setApi(api)`             | If valid, adds the API to the client. If invalid, returns the API's errors.          | `IBotApiInput`           | `ZodValidationResult <IBotApi>`           | `{description: "", endpoint: "https://..."}`                                                 |
| `validateApi(api)`        | Validates a given API. No side effects                                               | `IBotApiInput`           | `ZodValidationResult <IBotApi>`           | `{description: "",  endpoint: "https://...",  params: [{name: "q", value: "search term"}] }` |
| `getBot()`                | Returns the bot, if it's set, or throws an error.                                    |                          | `IBotData`                                |                                                                                              |
| `validateParam(param)`    | Validates a given API's parameter  (headers, authentication, body, jsonBody, params) | `IBotDataParameterInput` | `ZodValidationResult <IBotDataParameter>` | `{"name": "q", value: "search term", isValue: false}`                                        |
| `sendInteraction(prompt)` | Sends an interaction to the server and returns the answer                            | `string`                 | `Promise <IInteractionConsumerResponse>`  | `"How many kittens are there in Paris?"`                                                     |