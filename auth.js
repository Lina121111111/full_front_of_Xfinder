const API_URL = 'http://localhost:8000';


// ======= ЛОГИКА РЕГИСТРАЦИИ =======

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors();

        const lastName = getValue('lastName');
        const firstName = getValue('firstName');
        const patronymic = getValue('patronymic');
        const fullName = `${lastName} ${firstName} ${patronymic}`.trim();

        const city = getValue('city');
        const email = getValue('email');
        const password = getValue('password');
        const role = getValue('roleSelect');

        if (!role) {
            showError('roleSelectError', 'Выберите роль');
            return;
        }

        if (password.length < 8) {
            showError('passwordError', 'Пароль должен быть не менее 8 символов');
            return;
        }

        const userData = {
            email,
            password,
            role,
            full_name: fullName,
        };

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                handleServerError(errorData);
                return;
            }

            // Успех — редиректим
            alert("Регистрация прошла успешно!");
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Сервер недоступен. Повторите позже.");
        }
    });

    function getValue(id) {
        return document.getElementById(id)?.value.trim() || '';
    }

    function showError(id, message) {
        const errorElement = document.getElementById(id);
        if (errorElement) errorElement.textContent = message;
    }

    function clearErrors() {
        document.querySelectorAll('.error').forEach(el => el.textContent = '');
    }

    function handleServerError(errorData) {
        if (errorData.detail?.includes("already exists")) {
            showError('emailError', 'Пользователь с такой почтой уже зарегистрирован');
        } else {
            alert(`Ошибка: ${errorData.detail || 'Неизвестная ошибка'}`);
        }
    }
});



// ======= ЛОГИКА ВХОДА В СИСТЕМУ =======

const loginForm = document.querySelector('form');
if (window.location.pathname.includes('login.html') && loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value.trim();

        if (!email || !password) {
            alert("Введите email и пароль");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("username", email);  // важно: не email, а username
            formData.append("password", password);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                body: formData
                // НЕ ставь headers: Content-Type — браузер сам выставит boundary
            });


            if (!response.ok) {
                const errorData = await response.json();
                alert(`Ошибка входа: ${errorData.detail || 'Неизвестная ошибка'}`);
                return;
            }

            const data = await response.json();

            // Сохраняем токены в localStorage (или sessionStorage)
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            localStorage.setItem('userRole', data.role);

            alert("Вы успешно вошли!");
            // Перенаправляем на главную (или личный кабинет)
            window.location.href = 'profile.html'; // заменишь по своему пути
        } catch (error) {
            console.error("Ошибка входа:", error);
            alert("Сервер недоступен. Повторите позже.");
        }
    });
}
