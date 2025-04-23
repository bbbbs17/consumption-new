// src/lib/api.js

export async function signupUser({ email, name, password }) {
  const res = await fetch("http://localhost:8081/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "회원가입 실패");
  }

  return await res.json();
}
