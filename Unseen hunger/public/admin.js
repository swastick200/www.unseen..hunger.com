const storageKey = "unseen-admin-token";

const loginForm = document.querySelector("#admin-login");
const tokenInput = document.querySelector("#admin-token");
const tokenStatus = document.querySelector("#admin-token-status");
const errorNode = document.querySelector("#admin-error");
const listNode = document.querySelector("#feedback-list");
const countNode = document.querySelector("#feedback-count");
const statusNode = document.querySelector("#admin-status");
const refreshButton = document.querySelector("#refresh-feedback");
const logoutButton = document.querySelector("#logout-admin");
const localFeedbackKey = "unseen-local-feedback";
const apiBase = window.location.protocol === "file:" ? "http://localhost:3000" : "";
let currentItems = [];

function getToken() {
    return tokenInput.value.trim();
}

function renderEntries(items) {
    currentItems = items;
    countNode.textContent = String(items.length);

    if (!items.length) {
        listNode.innerHTML = '<div class="admin-card"><p class="admin-subtext">No feedback entries yet.</p></div>';
        return;
    }

    listNode.innerHTML = items
        .map((item) => `
            <article class="admin-card feedback-entry">
                <div class="feedback-entry-top">
                    <h2>${item.name}</h2>
                    <span class="chip">Rating ${item.rating}/5</span>
                </div>
                <p class="admin-subtext">${item.message}</p>
                <div class="feedback-meta">
                    <span>Phone: ${item.phone || "Not provided"}</span>
                    <span>${new Date(item.createdAt).toLocaleString()}</span>
                </div>
            </article>
        `)
        .join("");
}

async function loadFeedback() {
    const token = getToken();
    const localItems = JSON.parse(window.localStorage.getItem(localFeedbackKey) || "[]");
    if (!token) {
        renderEntries(localItems);
        statusNode.textContent = localItems.length ? "Local" : "Ready";
        errorNode.textContent = localItems.length
            ? "Showing locally saved feedback from this browser. Enter the admin token to load server feedback too."
            : "Enter the admin token to load server feedback.";
        return;
    }

    statusNode.textContent = "Loading";
    errorNode.textContent = "";

    try {
        const response = await fetch(`${apiBase}/api/feedback`, {
            headers: {
                "x-admin-token": token,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to load feedback.");
        }

        const serverItems = Array.isArray(data) ? data : [data];
        renderEntries([...localItems, ...serverItems]);
        statusNode.textContent = "Ready";
    } catch (error) {
        statusNode.textContent = localItems.length ? "Local" : "Error";
        errorNode.textContent = localItems.length
            ? "Backend unavailable. Start Start-UnseenHunger.bat to load server feedback. Showing local feedback from this browser."
            : error.message;
        renderEntries(localItems);
    }
}

if (loginForm) {
    const storedToken = window.localStorage.getItem(storageKey);
    const localItems = JSON.parse(window.localStorage.getItem(localFeedbackKey) || "[]");

    renderEntries(localItems);
    if (localItems.length) {
        statusNode.textContent = "Local";
        errorNode.textContent = "Showing locally saved feedback from this browser. Start Start-UnseenHunger.bat and enter the admin token to load server feedback too.";
    }

    if (storedToken) {
        tokenInput.value = storedToken;
        tokenStatus.textContent = "Token saved in this browser.";
        loadFeedback();
    }

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        window.localStorage.setItem(storageKey, getToken());
        tokenStatus.textContent = "Token saved in this browser.";
        loadFeedback();
    });

    refreshButton.addEventListener("click", () => {
        loadFeedback();
    });

    logoutButton.addEventListener("click", () => {
        window.localStorage.removeItem(storageKey);
        tokenInput.value = "";
        tokenStatus.textContent = "Token not saved yet.";
        statusNode.textContent = "Ready";
        errorNode.textContent = "";
        renderEntries([]);
    });
}
