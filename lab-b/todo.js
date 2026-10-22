export class TODOList {
    constructor() {
        this.items = []
    }
    addItem(name, dueDate, done, domRef) {
        this.items.push(new TODOItem(name, dueDate, done, domRef));
    }
    editItem(domRef, name, dueDate, done) {
        const item = this.items.find(item => item.domRef === domRef);
        if (item) {
            item.setName(name);
            item.setDueDate(dueDate);
            item.setDone(done);
        }
    }
    removeItem(domRef) {
        const index = this.items.findIndex(item => item.domRef === domRef);
        if (index !== -1) {
            console.log("Item removed");
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

}

export class TODOItem {
    constructor(name, dueDate, done, domRef) {
        this.name = name;
        this.dueDate = dueDate;
        this.done = done;
        this.domRef = domRef
    }

    setName(name) {
        this.name = name ? name : this.name;
    }

    setDueDate(dueDate) {
        this.dueDate = dueDate ? dueDate : this.dueDate;
    }

    setDone(done) {
        this.done = done;
    }
}



