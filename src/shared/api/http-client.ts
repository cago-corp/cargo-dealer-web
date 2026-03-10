type RequestOptions = RequestInit & {
  headers?: HeadersInit;
};

export async function httpClient<T>(input: RequestInfo | URL, init?: RequestOptions) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
