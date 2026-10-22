import { TODOList } from './todo.js';

let todoList = new TODOList();

function buildNewTaskElement() {
    const container = document.getElementById('todoContainer');

    let itemContainer = document.createElement('div');


    let checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.onchange = () => {
        todoList.editItem(itemContainer, null, null, checkBox.checked);
    }

    let name = document.createElement('span');
    name.textContent = "New Task";
    name.contentEditable = "true";
    let previousName = name.textContent;

    name.onclick = () => {
        previousName = name.textContent.trim();
    }

    name.onblur = () => {
        const trimmed = name.textContent.trim();
        if (trimmed === "") {
            console.log("Can't enter empty name:", name.textContent);
            name.textContent = previousName;
            return;
        }

        previousName = trimmed;
        todoList.editItem(itemContainer, trimmed, null, null);
        console.log("Update title:", trimmed);
    }

    name.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            name.blur();
        }
    }

    let date = document.createElement('input');
    date.type = "date";


    date.onchange = () => {
        todoList.editItem(itemContainer, null, date.value, null);
    }

    let deleteButton = document.createElement('button');
    deleteButton.textContent = "❌";
    deleteButton.onclick = () => {
        let isRemoved = todoList.removeItem(itemContainer);
        console.log(isRemoved ? "Item removed" : "ERROR: Item not removed");
        itemContainer.remove();
    }

    container.appendChild(itemContainer);
    itemContainer.appendChild(checkBox);
    itemContainer.appendChild(name)
    itemContainer.appendChild(date);
    itemContainer.appendChild(deleteButton);

    return itemContainer;
}
document.getElementById('addTask').addEventListener('click', () => {
    let newItem = buildNewTaskElement();
    todoList.addItem("New task", new Date(), false, newItem);
    console.log(todoList.items);
});
