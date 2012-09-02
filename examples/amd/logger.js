define(["knockout"], function(ko) {
    return function(bindings) {
        var log = [];

        var instrumentBinding = function(prop, binding, log) {
            var stats = { count: ko.observable(0), prop: prop };
            log.push(stats);
            return function(context) {
                setTimeout(function() { stats.count(stats.count() + 1); }, 0);
                return binding.call(this, context);
            };
        };

        //wrap the bindings in a version that adds some instrumentation
        for (var prop in bindings) {
            if (bindings.hasOwnProperty(prop)) {
                bindings[prop] = instrumentBinding(prop, bindings[prop], log);
            }
        }

        //add some bindings for the stats (that are not instrumented themselves)
        bindings.stats = function() { return { foreach: this } };
        bindings.stat = function() { return { text: this.prop } };
        bindings.count = function() { return { text: this.count } };

        return log;
    };
});