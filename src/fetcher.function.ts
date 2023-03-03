import axios, { AxiosResponse } from "axios";
import { Observable, from } from "rxjs";
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
): Observable<T> => {
    return from<Promise<T>>(
        axios.request({
            url,
            method,
            baseURL: configuration.baseUrl ?? config.baseUrl,
            headers: defaultHeaders(configuration),
            withCredentials: true,
            validateStatus: function (status: number) {
                return ![401, 400, 403, 500, 503, 422, 404].includes(status);
            },
            ...body ? { data: body } : {},
        })
            .then((r: AxiosResponse<T>) => r.data),
    )
};
