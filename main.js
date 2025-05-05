// main.js

// Путь к API (пока локально)
const API_URL = 'http://localhost:8000';

// Функция для отправки POST-запроса
async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка запроса');
    }

    return response.json();
}


// Получение списка вакансий
async function fetchVacancies() {
    try {
        const response = await fetch(`${API_URL}/vacancies/`);
        if (!response.ok) {
            throw new Error('Не удалось загрузить вакансии');
        }
        const vacancies = await response.json();
        renderVacancies(vacancies);
    } catch (error) {
        console.error('Ошибка при загрузке вакансий:', error);
    } finally {
        hideLoader();
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    const accessToken = localStorage.getItem("accessToken");

    const authButtons = document.getElementById("authButtons");
    const profileMenu = document.getElementById("profileMenu");
    const userNameSpan = document.getElementById("userName");

    if (!accessToken) {
        authButtons.classList.remove("hidden");
        profileMenu.classList.add("hidden");
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/users/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            // Попробуем обновить токен
            const success = await tryRefreshToken();
            if (success) return location.reload();

            showGuestUI();
            return;
        }

        const user = await response.json();
        userNameSpan.textContent = user.full_name;

        authButtons.classList.add("hidden");
        profileMenu.classList.remove("hidden");

    } catch (err) {
        console.error("Ошибка проверки токена", err);
        showGuestUI();
    }
});

function showGuestUI() {
    document.getElementById("authButtons").classList.remove("hidden");
    document.getElementById("profileMenu").classList.add("hidden");
}

function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    location.reload();
}

async function tryRefreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    const res = await fetch("http://localhost:8000/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem("accessToken", data.access_token);
    return true;
}
