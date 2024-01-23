export function urlResolve(from: string, to: string): string {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'))
  if (resolvedUrl.protocol === 'resolve:') {
    // `from` is a relative URL.
    const { pathname, search, hash } = resolvedUrl
    return pathname + search + hash
  }
  return resolvedUrl.toString()
}
export async function fetchWithTimeoutAndFallback(urls: string[], timeout = 5000) {
    // Function to fetch with a timeout
    async function fetchWithTimeout(url: string, timeout: number) {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchPromise = fetch(url, { signal });

        // Timeout logic
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetchPromise;
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // Loop through the URLs
    for (const url of urls) {
        try {
            const response = await fetchWithTimeout(url, timeout);
            if (response.ok) {
                return await response.json(); // or response.text(), depending on your needs
            }
            // Handle HTTP error statuses
            console.error(`Fetch failed for ${url}: ${response.statusText}`);
        } catch (error) {
            console.error(`Error fetching ${url}:`, (error as Error).message);
            // If it's a network error or timeout, try the next URL
        }
    }
    throw new Error("All fetch attempts failed");
}
