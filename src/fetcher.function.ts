import axios, { AxiosResponse } from "axios";
import { Observable, from } from "rxjs";
import { config } from "./config";

const defaultHeaders = (apiKey: string): Record<string, string> => {
    const headers: Record<string, string> = {};

    headers.Authorization = "Bearer " + apiKey;
    headers["content-type"] = "application/json";
    headers["host-origin"] = window.location.origin;

    return headers;
};

export const fetcher = <T, BodyType = T>(
    apiKey: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    body?: BodyType,
    followUnauthorizedRedirects: boolean = true,
): Observable<T> => {
    return from<Promise<T>>(
        axios.request({
            url,
            method,
            baseURL: config.baseUrl,
            headers: defaultHeaders(apiKey),
            withCredentials: true,
            validateStatus: function (status: number) {
                return ![401, 400, 403, 500, 503, 422, 404].includes(status);
            },
            ...body ? { data: body } : {},
        })
            .then((r: AxiosResponse<T>) => r.data),
    )
};
