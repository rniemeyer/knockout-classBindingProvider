require.config({
    paths: {
        "knockout": "../../ext/knockout-2.1.0",
        "classBindingProvider": "../../build/knockout-classBindingProvider.min"
    }
});

require(["knockout", "classBindingProvider", "viewModel", "item", "bindings", "logger", "classBindingProvider"], function(ko, ClassBindingProvider, ViewModel, Item, bindings, Logger) {
    console.log("here", ClassBindingProvider);
    ko.bindingProvider.instance = new ClassBindingProvider(bindings);

    ko.applyBindings(new Logger(bindings), document.getElementById("stats"));

    ko.applyBindings(new ViewModel([
        new Item("Pen"),
        new Item("Pencil"),
        new Item("Eraser")
    ]), document.getElementById("content"));
});
