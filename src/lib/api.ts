export async function safeFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  
  const contentType = res.headers.get("content-type");
  let data: any = null;
  
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
    }
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `Server error: ${res.status}`);
    }
    data = text;
  }

  if (!res.ok) {
    const error = (data && typeof data === 'object' && data.error) || data || `Request failed with status ${res.status}`;
    throw new Error(error);
  }

  return data;
}
