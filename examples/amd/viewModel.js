define(["knockout", "item"], function(ko, Item) {
    return function(items) {
        var self = this;

        this.editable = ko.observable(true);

        this.items = ko.observableArray(items);

        this.addItem = function() {
            self.items.push(new Item("New"));
        };

        this.deleteItem = function(item) {
            self.items.remove(item);
        };
    };
});
