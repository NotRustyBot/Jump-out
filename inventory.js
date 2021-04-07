let ItemInfo = {
    1: { // ore
        tag: 0,
        stackable: true,
        name:"Ore",
    },
    2: { // scrap
        tag: 0,
        stackable: true,
        name:"Scrap",
    },
    3: { // crystals
        tag: 0,
        stackable: true,
        name:"Crystals",
    },
    5: { // naviBeacon
        tag: 1,
        stackable: false,
        name:"Navigation Beacon",
    },
}

function Item(id, stack) {
    this.id = id;
    this.stack = stack;
    this.stats = ItemInfo[id];
}

function Slot(capacity, filter) {
    this.filter = filter == undefined ? -1 : filter;
    this.capacity = capacity == undefined ? -1 : capacity;
    this.inventory;
    this.item = new Item(0, 0);
    this.addItem = function (item) {
        if (this.item.id == 0 || this.item.id == item.id) {
            let taken = 0;
            if (this.filter == -1) {
                if (item.stats.stackable) {
                    taken = Math.min(this.inventory.capacity - this.inventory.used, item.stack);
                } else {
                    taken = Math.min(this.inventory.capacity - this.inventory.used, 1);
                }
                this.inventory.used += taken;
            } else if (this.filter == item.stats.tag) {
                taken = Math.min(this.capacity - this.item.stack, item.stack);
            } else {
                return 0; // filter mismatch
            }
            this.item.id = item.id;
            this.item.stack += taken;
            return taken; // == 0) inventory full
        } else {
            return 0; // item mismatch
        }
    }
    this.removeItem = function (item) {
        let taken = 0;
        if (this.item.id == item.id) {
            taken = Math.min(this.item.stack, item.stack);
            this.item.stack -= taken;
            if (this.item.stack == 0) {
                this.item.id = 0;
            }

            if (this.filter == -1) {
                this.inventory.used -= taken;
            }
        }
        return taken;
    }
}

function Inventory(capacity, owner, layout) {
    /**
     * @type {Slot[]}
     */
    this.slots = [];
    this.capacity = capacity;
    this.used = 0;
    this.owner = owner;
    if (owner == undefined) this.owner = -1;
    this.addItem = function (item) {
        let request = item.stack;
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            item.stack -= slot.addItem(item);
            Inventory.changes.push({ shipId: this.owner, slot: i, item: slot.item.id, stack: slot.item.stack });
            if (item.stack == 0) break;
        }
        return item.stack;
    }
    this.countItem = function (itemID) {
        let count = 0;
        for (let i = this.slots.length - 1; i >= 0; i--) {
            const slot = this.slots[i];
            if (slot.item.id == itemID) {
                count += slot.item.stack;
            }
        }

        return count;
    }
    this.removeItem = function (item) {
        let request = item.stack;
        for (let i = this.slots.length - 1; i >= 0; i--) {
            const slot = this.slots[i];
            if (slot.item.id == item.id) {
                request -= slot.item.stack;
            }
            if (request <= 0) break;
        }

        if (request <= 0) {
            request = item.stack;
            for (let i = this.slots.length - 1; i >= 0; i--) {
                const slot = this.slots[i];
                item.stack -= slot.removeItem(item);
                Inventory.changes.push({ shipId: this.owner, slot: i, item: slot.item.id, stack: slot.item.stack });
                if (item.stack == 0) break;
            }
            return true;
        } else {
            return false;
        }
    }
    this.addSlot = function (slot) {
        slot.inventory = this;
        this.slots.push(slot);
    }
    for (let i = 0; i < layout.length; i++) {
        const e = layout[i];
        if (e.unique) {
            this.addSlot(new Slot(e.capacity, e.filter));
        } else {
            this.addSlot(new Slot());
        }
    }
}
