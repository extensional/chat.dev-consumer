import { config } from "./config";

interface RequestConfiguration {
    apiKey: string;
    origin?: string;
    baseUrl?: string;
}

const defaultHeaders = (configuration: RequestConfiguration): Record<string, string> => {
    const headers: Record<string, string> = {};

    headers.Authorization = "Bearer " + configuration.apiKey;
    headers["content-type"] = "application/json";
    if (configuration?.origin) {
        headers["origin"] = configuration.origin;
    }

    return headers;
};

export const fetcher = <T, BodyType = T>(
    configuration: RequestConfiguration,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    body?: BodyType
): Promise<T> => {
    return fetch(`${configuration.baseUrl ?? config.baseUrl}${url}`, {
        method,
        headers: defaultHeaders(configuration),
        body: body ? JSON.stringify(body) : undefined,
    })
        .then((r) => r.json());

};
