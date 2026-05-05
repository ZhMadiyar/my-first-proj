// Promise.race
async function fetchWithTimeout(url, timeoutMs = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Retry
async function fetchWithRetry(url, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetchWithTimeout(url, 5000);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`Попытка ${i + 1} не удалась: ${error.message}`);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error; 
            }
        }
    }
}

async function loadTodos() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const resultsEl = document.getElementById('results');

    // Переменные состояния
    let isLoading = true;
    let error = null;
    let data = null;

    try {
        // Отображение состояния загрузки
        loadingEl.style.display = 'block';
        errorEl.innerText = '';
        resultsEl.innerHTML = '';

        // Параллельная загрузка с помощью Promise.all
        const [todos, users] = await Promise.all([
            fetchWithRetry('https://jsonplaceholder.typicode.com/todos?_limit=5'),
            fetchWithRetry('https://jsonplaceholder.typicode.com/users?_limit=5')
        ]);

        data = { todos, users };
        
        // Отрисовка успешного результата
        resultsEl.innerHTML = `
            <h2>Пользователи:</h2>
            <ul>${data.users.map(u => `<li>${u.name}</li>`).join('')}</ul>
            <h2>Задачи:</h2>
            <ul>${data.todos.map(t => `<li>${t.title}</li>`).join('')}</ul>
        `;
    } catch (err) {
        error = err.message;
        errorEl.innerText = `Не удалось загрузить данные: ${error}`;
    } finally {
        isLoading = false;
        loadingEl.style.display = 'none';
    }
}

// 4. Привязка к кнопке
document.getElementById('loadBtn').addEventListener('click', loadTodos);