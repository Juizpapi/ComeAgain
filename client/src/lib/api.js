const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function request(path, options = {}) {
  const token = localStorage.getItem("comeagain_token");

  const headers = {
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),

    ...(options.headers || {}),
  };

  // Only add JSON Content-Type if we're NOT sending FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}