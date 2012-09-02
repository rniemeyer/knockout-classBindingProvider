define(function() {
    //create an object that holds our bindings
    return {
        editable: function() {
            return { checked: this.editable };
        },
        //this is an example of a binding tht is shared across scopes and fields
        enabled: function(context) {
            return { enable: context.$root.editable };
        },
        items: function() {
            return { foreach: this.items };
        },
        edit: function() {
            return { value: this.name };
        },
        delete: function(context) {
            return { click: context.$parent.deleteItem };
        },
        add: function() {
            return { click: this.addItem };
        },
        view: function() {
            return { text: this.name };
        }
    };
});
