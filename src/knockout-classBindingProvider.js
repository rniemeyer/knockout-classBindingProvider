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
                classes = "", clas,
                virtualDataAttributes,
                virtualNode;

            if (node.nodeType === 1) {
                classes = node.getAttribute(this.attribute);
                virtualNode = node;
            }
            else if (node.nodeType === 8) {
                value = "" + node.nodeValue || node.text;
                index = value.indexOf(virtualAttribute);

                if (index > -1) {
                    virtualDataAttributes = value.substring(index + virtualAttribute.length).split(',');
                    classes = virtualDataAttributes[0];
                    virtualDataAttributes = virtualDataAttributes.slice(1);
                }

                virtualNode = {};
                virtualNode.getAttribute = function(name) {
                    return ko.utils.arrayFirst(virtualDataAttributes, function(attr) {
                        var index = attr.indexOf(name + ":");
                        if (index > -1) {
                            return attr.substring(index + name.length + 1).replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
                        }
                    });
                };

            }

            if (classes) {
                classes = classes.split(' ');
                //evaluate each class, build a single object to return
                for (i = 0, j = classes.length; i < j; i++) {
                    clas = classes[i];
                    if (clas.length === 0) continue;
                    bindingAccessor = this.bindings[clas];
                    if (bindingAccessor) {
                        binding = typeof bindingAccessor == "function" ? bindingAccessor.call(bindingContext.$data, bindingContext, virtualNode) : bindingAccessor;
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