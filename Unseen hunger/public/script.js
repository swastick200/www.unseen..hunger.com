const revealElements = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = document.querySelectorAll(".nav-links a");

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.18 }
);

revealElements.forEach((element) => revealObserver.observe(element));

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navAnchors.forEach((anchor) => {
        anchor.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

const feedbackForm = document.querySelector("#feedback-form");
const feedbackStatus = document.querySelector("#feedback-status");
const localFeedbackKey = "unseen-local-feedback";
const apiBase = window.location.protocol === "file:" ? "http://localhost:3000" : "";
const localFallbackHosts = new Set(["localhost", "127.0.0.1"]);

if (feedbackForm && feedbackStatus) {
    feedbackForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        feedbackStatus.textContent = "Sending feedback...";

        const formData = new FormData(feedbackForm);
        const entry = {
            id: Date.now(),
            name: formData.get("name"),
            phone: formData.get("phone"),
            rating: formData.get("rating"),
            message: formData.get("message"),
            createdAt: new Date().toISOString(),
        };

        const saveLocally = () => {
            const existing = JSON.parse(window.localStorage.getItem(localFeedbackKey) || "[]");
            existing.unshift({ ...entry, localOnly: true });
            window.localStorage.setItem(localFeedbackKey, JSON.stringify(existing));
            feedbackForm.reset();
            feedbackStatus.textContent = "Backend unavailable. Start Start-UnseenHunger.bat, then try again. Saved locally on this device for now.";
        };

        const payload = {
            name: entry.name,
            phone: entry.phone,
            rating: entry.rating,
            message: entry.message,
        };

        const canUseLocalFallback =
            window.location.protocol === "file:" || localFallbackHosts.has(window.location.hostname);

        try {
            const response = await fetch(`${apiBase}/api/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to send feedback.");
            }

            feedbackForm.reset();
            feedbackStatus.textContent = "Thanks. Your feedback has been saved.";
        } catch (error) {
            if (canUseLocalFallback) {
                saveLocally();
                return;
            }

            feedbackStatus.textContent = error instanceof Error
                ? error.message
                : "Feedback service is unavailable right now.";
        }
    });
}
