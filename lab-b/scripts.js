import { TODOList, TODOListBuilder } from './todo.js';

let todoList = new TODOList();

let addTaskButton = document.getElementById('addTask');
let searchField = document.getElementById('searchField');
let errorSpan = document.getElementById('error');
let errorTimeout = null;

export function showError(message = "You haven't finished adding task. Can't add another one.") {
    errorSpan.textContent = message;
    errorSpan.classList.add('show');
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
        errorSpan.classList.remove('show');
    }, 3000);
}

addTaskButton.addEventListener('click', () => {
    const incompleteTask = todoList.items.find(
        item => item.name.length < 3 || item.name.length > 255
    );

    if (incompleteTask) {
        showError("Task name must be between 3 and 255 characters.");
        return;
    }

    errorSpan.classList.remove('show');

    new TODOListBuilder(todoList)
        .addCheckbox(false)
        .addNameField('')
        .addDate()
        .addDeleteButton('✕')
        .build();

    console.log(todoList.items);
});

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

searchField.addEventListener('input', () => {
    const query = searchField.value.trim();

    for (const item of todoList) {
        const span = item.domRef.querySelector('span[contenteditable="true"]');

        if (query.length < 2) {
            item.domRef.style.display = '';
            if (span) span.textContent = item.name;
            continue;
        }

        const isMatch = item.name.toLowerCase().includes(query.toLowerCase());
        item.domRef.style.display = isMatch ? '' : 'none';

        if (span) {
            if (isMatch) {
                const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
                span.innerHTML = item.name.replace(regex, '<mark>$1</mark>');
            } else {
                span.textContent = item.name;
            }
        }
    }
});
