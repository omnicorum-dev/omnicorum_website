const form = document.querySelector("#guess-form");
const input = document.querySelector("#final-guess");
const statusLine = document.querySelector("#guess-status");

// SHA-256 digests of the normalized correct answers (not the plaintext itself).
const correctHashes = new Set([
  "db4f833e0c36db9a39b8df145d664651033f43f16a05aa08bd5d78dd8b06be6c",
  "3267349210f70f3366fa09e59d41c732b90bc1c0cf1720f301a9b34bb92ccf96",
]);

const normalizeAnswer = (answer) =>
  answer.trim().toLowerCase().replace(/^["']|["']$/g, "").replace(/[.!?]+$/g, "");

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

if (form && input && statusLine) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const guess = normalizeAnswer(input.value);
    const hash = await sha256Hex(guess);

    if (correctHashes.has(hash)) {
      window.location.href = "theendofanera.html";
      return;
    }

    statusLine.textContent = "incorrect. try again.";
  });
}
