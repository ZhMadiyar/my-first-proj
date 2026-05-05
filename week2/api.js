let allTodos = [];
let filteredTodos = [];
let currentPage = 1;
const itemsPerPage = 10;

const apiMain = document.getElementById('api-main');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('error-message');
const searchInput = document.getElementById('searchInput');

// 1. ФУНКЦИЯ ЗАГРУЗКИ (Fetch + then/catch)
function fetchData() {
    loader.style.display = 'block';
    errorMsg.innerText = '';
    apiMain.innerHTML = '';

    fetch('https://jsonplaceholder.typicode.com/todos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Server responded with error: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            allTodos = data;
            filteredTodos = data; // Изначально фильтрованные данные равны всем
            renderAPI();
        })
        .catch(err => {
            errorMsg.innerText = 'Network error: ' + err.message;
        })
        .finally(() => {
            loader.style.display = 'none';
        });
}

// 2. ФУНКЦИЯ РЕНДЕРА (Пагинация через slice)
function renderAPI() {
    apiMain.innerHTML = '';
    
    // Вычисляем границы для текущей страницы
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredTodos.slice(start, end);

    pageItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'api-item';
        itemDiv.innerHTML = `
            <strong>#${item.id}</strong> ${item.title} 
            <span style="color: green;">${item.completed ? 'Done' : 'Wait...'}</span>
        `;
        apiMain.appendChild(itemDiv);
    });

    document.getElementById('pageInfo').innerText = `Page ${currentPage}`;
}

// 3. ПОИСК (Фильтрация)
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredTodos = allTodos.filter(todo => 
        todo.title.toLowerCase().includes(term)
    );
    currentPage = 1; // При поиске сбрасываем на 1 страницу
    renderAPI();
});

// 4. ПАГИНАЦИЯ (Кнопки)
document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentPage * itemsPerPage < filteredTodos.length) {
        currentPage++;
        renderAPI();
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderAPI();
    }
});

document.getElementById('refreshBtn').addEventListener('click', fetchData);

// Начальный запуск
fetchData();