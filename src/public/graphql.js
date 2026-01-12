export async function gql(query, variables = {}, { auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("token") || "";
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const r = await fetch("/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const data = await r.json();
  if (data.errors?.length) throw new Error(data.errors[0].message);
  return data.data;
}

export function parseJWT(token) {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}
