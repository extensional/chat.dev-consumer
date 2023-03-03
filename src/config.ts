export const config = {
    baseUrl: "https://api.chat.dev",
    webUrl: "https://chat.dev",
    settingsUrl: "https://chat.dev/settings"
}

export const clientErrors = {
    invalidBot: "bot is invalid. please validate the bot first",
    mustSetBot: "please set a bot first",
    invalidKey: "you can find the key on " + config.webUrl,
    apiAdded: "there's already an API with the same Endpoint and Method."
}