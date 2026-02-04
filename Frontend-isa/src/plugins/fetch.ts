const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://api.isa-ambato.mg";

type FetchOptions = RequestInit & {
    json?: any;
};

export async function apiFetch(
    url: string,
    options: FetchOptions = {}
) {
    const { json, headers, ...rest } = options;

    return fetch(`${API_BASE_URL}${url}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(headers || {}),
        },
        body: json ? JSON.stringify(json) : rest.body,
        ...rest,
    });
}
