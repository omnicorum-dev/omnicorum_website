const form = document.querySelector("#guess-form");
const input = document.querySelector("#final-guess");
const statusLine = document.querySelector("#guess-status");
const correctAnswers = [
  "the end of an era",
  "end of an era",
];

const normalizeAnswer = (answer) =>
  answer.trim().toLowerCase().replace(/^["']|["']$/g, "").replace(/[.!?]+$/g, "");

if (form && input && statusLine) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const guess = normalizeAnswer(input.value);

    if (correctAnswers.some((answer) => guess === normalizeAnswer(answer))) {
      window.location.href = "theendofanera.html";
      return;
    }

    statusLine.textContent = "incorrect. try again.";
  });
}
