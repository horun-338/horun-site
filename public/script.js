const form = document.getElementById("request-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");
const yearEl = document.getElementById("year");
const heroBg = document.querySelector(".hero-bg");

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

function setStatus(text, type) {
  statusEl.textContent = text;
  statusEl.classList.remove("is-ok", "is-error");
  if (type) statusEl.classList.add(type);
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") || "").trim(),
    contact: String(data.get("contact") || "").trim(),
    message: String(data.get("message") || "").trim(),
  };

  if (!payload.name || !payload.contact || !payload.message) {
    setStatus("Заполни все поля.", "is-error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Отправляю сигнал…");

  try {
   const response = await fetch("/.netlify/functions/send-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Не удалось отправить заявку.");
    }

    form.reset();
    setStatus("Заявка отправлена. Я скоро отвечу.", "is-ok");
  } catch (error) {
    setStatus(error.message || "Ошибка отправки.", "is-error");
  } finally {
    submitBtn.disabled = false;
  }
});

if (heroBg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      heroBg.style.transform = `translate(${x}px, ${y}px)`;
    },
    { passive: true }
  );
}
