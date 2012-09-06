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
    //  bindings - an object that contains the binding classes
    //  options - is an object that can include "attribute" and "fallback" options
    var classBindingsProvider = function(bindings, options) {
        var virtualAttribute = "ko class:",
            existingProvider = new ko.bindingProvider();

        options = options || {};

        //override the attribute
        this.attribute = options.attribute || "data-class";

        //fallback to the existing binding provider, if bindings are not found
        this.fallback = options.fallback;

        //this object holds the binding classes
        this.bindings = bindings || {};

        //determine if an element has any bindings
        this.nodeHasBindings = function(node) {
            var result, value;

            if (node.nodeType === 1) {
                result = node.getAttribute(this.attribute);
            }
            else if (node.nodeType === 8) {
                value = "" + node.nodeValue || node.text;
                result = value.indexOf(virtualAttribute) > -1;
            }

            if (!result && this.fallback) {
                result = existingProvider.nodeHasBindings(node);
            }

            return result;
        };

        //return the bindings given a node and the bindingContext
        this.getBindings = function(node, bindingContext) {
            var i, j, bindingAccessor, binding,
                result = {},
                value, index,
                classes = "", clas, params;

            if (node.nodeType === 1) {
                classes = node.getAttribute(this.attribute);
            }
            else if (node.nodeType === 8) {
                value = "" + node.nodeValue || node.text;
                index = value.indexOf(virtualAttribute);

                if (index > -1) {
                    classes = value.substring(index + virtualAttribute.length);
                }
            }

            if (classes) {
                classes = classes.split(' ');
                //evaluate each class, build a single object to return
                for (i = 0, j = classes.length; i < j; i++) {
                    clas = classes[i];
                    if (clas.length === 0) continue;
                    if (clas[clas.length - 1] === ')') {
                        clas = clas.split('(');
                        params = clas[1].slice(0, -1).split(',');
                        clas = clas[0];
                    }
                    else {
                        params = null;
                    }
                    bindingAccessor = this.bindings[clas];
                    if (bindingAccessor) {
                        binding = typeof bindingAccessor != "function"
                        ? bindingAccessor
                        : params == null
                            ? bindingAccessor.call(bindingContext.$data, bindingContext)
                            : bindingAccessor.apply(bindingContext.$data, [bindingContext].concat(params));
                        ko.utils.extend(result, binding);
                    }
                }
            }
            else if (this.fallback) {
                result = existingProvider.getBindings(node,bindingContext);
            }

            return result;
        };
    };

    if (!exports) {
        ko.classBindingProvider = classBindingsProvider;
    }

    return classBindingsProvider;
}));