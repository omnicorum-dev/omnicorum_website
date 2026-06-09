const form = document.querySelector("#guess-form");
const input = document.querySelector("#final-guess");
const statusLine = document.querySelector("#guess-status");
const correctAnswer = "the end of an era";
const correctAnswer2 = "end of an era";

if (form && input && statusLine) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const guess = input.value.trim().toLowerCase().replace(/[.!?]+$/g, "");

    if (guess === correctAnswer || gues === correctAnswer2) {
      window.location.href = "theendofanera.html";
      return;
    }

    statusLine.textContent = "incorrect. try again.";
  });
}
