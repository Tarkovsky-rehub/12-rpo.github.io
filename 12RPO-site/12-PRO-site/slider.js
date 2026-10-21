document.querySelectorAll(".slideshow").forEach((slider) => {
  const slides = [...slider.querySelectorAll(".slide")];
  const controls = slider.querySelector(".slideshow__controls");
  const previousButton = slider.querySelector(".slider-arrow--prev");
  const nextButton = slider.querySelector(".slider-arrow--next");
  const dotsContainer = slider.querySelector(".slider-dots");
  const toggleButton = slider.querySelector(".slider-toggle");
  const status = slider.querySelector(".slider-status");

  if (slides.length === 0) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const configuredInterval = Number(slider.dataset.interval);
  const interval = configuredInterval > 0 ? configuredInterval : 5000;

  let currentIndex = 0;
  let timer = null;
  let paused = reducedMotion.matches;
  let hovered = false;

  // Индикаторы создаются по числу фотографий в HTML.
  const dots = slides.map((slide, index) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "слайд");
    slide.setAttribute(
      "aria-label",
      `${index + 1} из ${slides.length}`
    );

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", `Показать фотографию ${index + 1}`);
    dot.setAttribute("aria-controls", "group-slides");

    dot.addEventListener("click", () => {
      showSlide(index, true);
      restartTimer();
    });

    dotsContainer.append(dot);
    return dot;
  });

  function showSlide(index, announce = false) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;

      slide.hidden = !active;
      slide.classList.toggle("is-active", active);

      if (active) {
        dots[slideIndex].setAttribute("aria-current", "true");
      } else {
        dots[slideIndex].removeAttribute("aria-current");
      }
    });

    // Автопереключение не прерывает пользователя экранного диктора.
    if (announce) {
      status.textContent =
        `Фотография ${currentIndex + 1} из ${slides.length}`;
    }
  }

  function stopTimer() {
    window.clearInterval(timer);
    timer = null;
  }

  function restartTimer() {
    stopTimer();

    const focused = slider.contains(document.activeElement);

    if (
      paused ||
      hovered ||
      focused ||
      document.hidden ||
      slides.length < 2
    ) {
      return;
    }

    timer = window.setInterval(() => {
      showSlide(currentIndex + 1);
    }, interval);
  }

  function updateToggle() {
    toggleButton.textContent = paused
      ? "Продолжить"
      : "Приостановить";

    toggleButton.setAttribute(
      "aria-label",
      paused
        ? "Включить автоматическое переключение фотографий"
        : "Приостановить автоматическое переключение фотографий"
    );
  }

  previousButton.addEventListener("click", () => {
    showSlide(currentIndex - 1, true);
    restartTimer();
  });

  nextButton.addEventListener("click", () => {
    showSlide(currentIndex + 1, true);
    restartTimer();
  });

  toggleButton.addEventListener("click", () => {
    paused = !paused;
    updateToggle();
    restartTimer();
  });

  slider.addEventListener("mouseenter", () => {
    hovered = true;
    stopTimer();
  });

  slider.addEventListener("mouseleave", () => {
    hovered = false;
    restartTimer();
  });

  slider.addEventListener("focusin", stopTimer);

  slider.addEventListener("focusout", () => {
    // Ждём, пока браузер переведёт фокус на следующий элемент.
    window.setTimeout(restartTimer, 0);
  });

  // Стрелки клавиатуры работают, когда фокус внутри слайд-шоу.
  slider.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();

    showSlide(
      currentIndex + (event.key === "ArrowRight" ? 1 : -1),
      true
    );

    restartTimer();
  });

  document.addEventListener("visibilitychange", restartTimer);

  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      paused = true;
      updateToggle();
      restartTimer();
    }
  });

  controls.hidden = slides.length < 2;

  showSlide(0);
  updateToggle();
  restartTimer();
});