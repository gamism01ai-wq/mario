const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const dateInput = document.getElementById('todo-date');
const list = document.getElementById('todo-list');
const clearBtn = document.getElementById('clear-completed');
const exportBtn = document.getElementById('export-json');
const importBtn = document.getElementById('import-json');
const fileInput = document.getElementById('file-input');
const coinSound = document.getElementById('coin-sound');

const STORAGE_KEY = 'mario-todo-list';

let todos = [];

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function load() {
  const data = localStorage.getItem(STORAGE_KEY);
  todos = data ? JSON.parse(data) : [];
}

function playCoin() {
  if (!coinSound) return;
  coinSound.currentTime = 0;
  coinSound.play().catch(() => {});
}

function render() {
  list.innerHTML = '';
  if (todos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'todo-item';
    empty.innerHTML = '<span class="todo-text">目前沒有待辦事項 ✨</span>';
    list.appendChild(empty);
    return;
  }

  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const meta = document.createElement('span');
    meta.className = 'todo-date';
    meta.textContent = todo.date ? `📅 ${todo.date}` : '📅 未選日期';

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '❌';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      todos.splice(idx, 1);
      save();
      render();
    });

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.flexDirection = 'column';
    left.style.gap = '4px';
    left.appendChild(text);
    left.appendChild(meta);

    li.appendChild(left);
    li.appendChild(del);

    li.addEventListener('click', () => {
      todo.done = !todo.done;
      save();
      render();
      playCoin();
    });

    list.appendChild(li);
  });
}

function addTodo() {
  const value = input.value.trim();
  if (!value) return;
  const date = dateInput?.value || '';
  todos.unshift({ text: value, date, done: false, createdAt: Date.now() });
  input.value = '';
  if (dateInput) dateInput.value = '';
  save();
  render();
  playCoin();
}

addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

clearBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save();
  render();
});

exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mario-todo.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      todos = data.map(item => ({
        text: String(item.text ?? ''),
        date: item.date ?? '',
        done: Boolean(item.done),
        createdAt: item.createdAt ?? Date.now()
      })).filter(item => item.text);
      save();
      render();
    }
  } catch (err) {
    alert('JSON 格式錯誤，請確認檔案內容。');
  }
});

load();
render();
