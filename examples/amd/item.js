define(["knockout"], function(ko) {
    return function(name) {
        this.name = ko.observable(name);
    };
});
