export class TODOList {
    static STORAGE_KEY = 'todo_items';
    #items;

    constructor() {
        this.#items = [];
        this.load();
    }

    save() {
        localStorage.setItem(TODOList.STORAGE_KEY, JSON.stringify(this.#items));
    }

    load() {
        const raw = localStorage.getItem(TODOList.STORAGE_KEY);
        if (!raw) return;

        try {
            const savedItems = JSON.parse(raw);
            for (const item of savedItems) {
                new TODOListBuilder(this)
                    .addCheckbox(item.done)
                    .addNameField(item.name)
                    .addDate(item.date)
                    .addDeleteButton('✕')
                    .build(false);
            }
        } catch (e) {
            console.error("Failed to load tasks from localStorage:", e);
        }
    }

    addItem(name, dueDate, done, domRef) {
        this.#items.push(new TODOItem(name, dueDate, done, domRef));
        this.save();
    }

    editItem(domRef, name, dueDate, done) {
        const item = this.#items.find(item => item.domRef === domRef);
        if (item) {
            item.name = name;
            item.date = dueDate;
            item.done = done;
            this.save();
        }
    }

    removeItem(domRef) {
        const index = this.#items.findIndex(item => item.domRef === domRef);
        if (index !== -1) {
            console.log("Item removed");
            this.#items.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    get items() {
        return this.#items;
    }

    [Symbol.iterator]() {
        return this.#items[Symbol.iterator]();
    }
}

class TODOItem {
    #name;
    #date;
    #done;
    #domRef;
    constructor(name, dueDate, done, domRef) {
        this.#name = name;
        this.#date = dueDate;
        this.#done = done;
        this.#domRef = domRef
    }

    get name() { return this.#name; }
    get date() { return this.#date; }
    get done() { return this.#done; }
    get domRef() { return this.#domRef; }

    set name(name) {
        if (name) this.#name = name;
    }
    set date(dueDate) {
        if (dueDate !== undefined) this.#date = dueDate;
    }
    set done(done) {
        this.#done = done ?? this.#done;
    }

    toJSON() {
        return {
            name: this.#name,
            date: this.#date ? this.#date.toISOString().split('T')[0] : '',
            done: this.#done
        };
    }

}


export class TODOListBuilder {
    static container = document.getElementById('todoContainer');

    constructor(todoList) {
        this.todoList = todoList;

        this.itemContainer = document.createElement('div');
        TODOListBuilder.container.appendChild(this.itemContainer);

        this.name = null;
        this.checkbox = null;
        this.date = null;
        this.deleteButton = null;
    }

    addNameField(taskName) {
        let name = document.createElement('span');
        name.textContent = taskName;
        name.contentEditable = "true";
        let previousName = name.textContent;

        name.onfocus = () => {
            // Strip any <mark> tags while editing so user edits plain text
            const currentItem = this.todoList.items.find(i => i.domRef === this.itemContainer);
            if (currentItem && currentItem.name) {
                name.textContent = currentItem.name;
            }
            if (name.textContent.trim().length >= 3) {
                previousName = name.textContent.trim();
            }
        }

        name.onblur = () => {
            const trimmed = name.textContent.trim();
            if (trimmed.length < 3 || trimmed.length > 255) {
                console.log("Task name must be between 3 and 255 characters:", name.textContent);
                name.textContent = previousName;
                return;
            }

            previousName = trimmed;
            name.textContent = trimmed;
            this.todoList.editItem(this.itemContainer, trimmed, undefined, undefined);
            console.log("Update title:", trimmed);
        }

        name.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                name.blur();
            }
        }

        this.name = name;
        this.itemContainer.appendChild(this.name);
        return this;
    }

    addCheckbox(checked) {
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.checked = checked;
        checkbox.onchange = () => {
            this.todoList.editItem(this.itemContainer, undefined, undefined, checkbox.checked);
        }

        this.checkbox = checkbox;
        this.itemContainer.appendChild(this.checkbox);
        return this;
    }

    addDate(dateInput = '') {
        let date = document.createElement('input');
        date.type = "date";
        date.value = dateInput;
        let previousDate = dateInput;

        date.onchange = () => {
            if (date.value) {
                const selected = new Date(date.value);
                selected.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selected <= today) {
                    console.log("Date must be empty or in the future:", date.value);
                    date.value = previousDate;
                    const errorSpan = document.getElementById('error');
                    if (errorSpan) {
                        errorSpan.textContent = "Date must be empty or in the future.";
                        errorSpan.classList.add('show');
                        setTimeout(() => errorSpan.classList.remove('show'), 3000);
                    }
                    return;
                }
            }

            previousDate = date.value;
            const parsedDate = date.value ? new Date(date.value) : null;
            this.todoList.editItem(this.itemContainer, undefined, parsedDate, undefined);
        }

        this.date = date;
        this.itemContainer.appendChild(this.date);
        return this;
    }

    addDeleteButton(text) {
        let deleteButton = document.createElement('button');
        deleteButton.textContent = text;
        deleteButton.onclick = () => {
            let isRemoved = this.todoList.removeItem(this.itemContainer);
            console.log(isRemoved ? "Item removed" : "ERROR: Item not removed");
            this.itemContainer.remove();
        }

        this.deleteButton = deleteButton;
        this.itemContainer.appendChild(this.deleteButton);
        return this;
    }

    build(autoFocus = true) {
        this.todoList.addItem(
            this.name?.textContent ?? '',
            this.date?.value ? new Date(this.date.value) : null,
            this.checkbox?.checked ?? false,
            this.itemContainer
        )

        if (autoFocus && this.name) {
            this.name.focus();
            window.getSelection().selectAllChildren(this.name);
        }
        return this.itemContainer;
    }
}
