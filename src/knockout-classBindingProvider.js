!(function(factory) {
    //AMD
    if (typeof define === "function" && define.amd) {
        define(["knockout", "exports"], factory);
        //normal script tag
    } else {
        factory(ko);
    }
}(function(ko, exports, undefined) {
    //a bindingProvider that uses something different than data-bind attributes
    var classBindingsProvider = function(bindings, attribute) {
        var virtualAttribute = "ko class:";
        this.attribute = attribute || "data-class";
        this.bindings = bindings || {};

        //determine if an element has any bindings
        this.nodeHasBindings = function(node) {
            var value;
            if (node.nodeType === 1) {
                return node.getAttribute(this.attribute);
            }
            else if (node.nodeType === 8) {
                value = "" + node.nodeValue || node.text;
                return value.indexOf(virtualAttribute) > -1;
            }
        };

        //return the bindings given a node and the bindingContext
        this.getBindings = function(node, bindingContext) {
            var i, j, bindingAccessor, binding,
                result = {},
                value, index,
                classes = "";

            if (node.nodeType === 1) {
                classes = node.getAttribute(this.attribute);
            }
            else if (node.nodeType === 8) {
                value = "" + node.nodeValue || node.text;
                index = value.indexOf(virtualAttribute);

                if (index > -1) {
                    classes = value.substring(index);
                }
            }

            if (classes) {
                classes = classes.split(' ');
                //evaluate each class, build a single object to return
                for (i = 0, j = classes.length; i < j; i++) {
                    bindingAccessor = this.bindings[classes[i]];
                    if (bindingAccessor) {
                        binding = typeof bindingAccessor == "function" ? bindingAccessor.call(bindingContext.$data, bindingContext) : bindingAccessor;
                        ko.utils.extend(result, binding);
                    }
                }
            }

            return result;
        };
    };

    if (!exports) {
        ko.classBindingProvider = classBindingsProvider;
    }

    return classBindingsProvider;
}));