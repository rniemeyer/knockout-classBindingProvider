!(function (factory) {
    //AMD
    if (typeof define === "function" && define.amd) {
        define(["knockout", "exports"], factory);
        //normal script tag
    } else {
        factory(ko);
    }
}(function (ko, exports, undefined) {
    //a bindingProvider that uses something different than data-bind attributes
    //  bindings - an object that contains the binding classes
    //  options - is an object that can include "attribute", "prefixAttribute", "virtualAttribute", bindingRouter, and "fallback" options
    var classBindingsProvider = function (bindings, options) {
        var existingProvider = new ko.bindingProvider();

        options = options || {};

        //override the attribute
        this.attribute = options.attribute || "data-class";

        //override the prefix attribute
        this.prefixAttribute = options.prefixAttribute || "data-class-prefix";

        //override the virtual attribute
        this.virtualAttribute = "ko " + (options.virtualAttribute || "class") + ":";

        //fallback to the existing binding provider, if bindings are not found
        this.fallback = options.fallback;

        //this object holds the binding classes
        this.bindings = bindings || {};

        //returns a binding class, given the class name and the bindings object
        this.bindingRouter = options.bindingRouter ? options.bindingRouter : function (className, bindings, classPrefix) {
            var i, j, classPath, bindingObject;

            //if there is a prefix, prepend it to the class name
            if (classPrefix && className.indexOf("$root") === -1) {
                className = classPrefix + "." + className;
            }

            className = className.replace("$root", "").replace(/(^\s*\.)|(\.\s*$)/g, '');

            //if the class name matches a property directly, then return it
            if (bindings[className]) {
                return bindings[className];
            }

            //search for sub-properites that might contain the bindings
            classPath = className.split(".");
            bindingObject = bindings;

            try {
                for (i = 0, j = classPath.length; i < j; i++) {
                    bindingObject = bindingObject[classPath[i]];
                }
            } catch (e) {
                throw "Cannot find binding: " + className;
            }

            return bindingObject;
        };

        //allow bindings to be registered after instantiation
        this.registerBindings = function (newBindings) {
            ko.utils.extend(this.bindings, newBindings);
        };

        //determine if an element has any bindings
        this.nodeHasBindings = function (node) {
            var result, value;

            if (node.nodeType === 1) {
                result = node.getAttribute(this.attribute);
            }
            else if (node.nodeType === 8) {
                value = "" + node.nodeValue || node.text;
                result = value.indexOf(this.virtualAttribute) > -1;
            }

            if (!result && this.fallback) {
                result = existingProvider.nodeHasBindings(node);
            }

            return result;
        };

        //cache combined prefix on real nodes
        this.cachePrefix = function (node, prefix) {
            if (node.nodeType === 1) {
                node.setAttribute(this.prefixAttribute, prefix);
            }
        };

        //Finds and returns combined prefix for node
        this.getPrefix = function (node) {
            if (!node.parentElement) {
                // We recursed to the body tag and didn't find any prefixes.
                // Return "$root" so that we don't have to do it again.
                return "$root";
            }

            var prefix = (node.nodeType === 1 && node.getAttribute(this.prefixAttribute) !== null) ? node.getAttribute(this.prefixAttribute) : null;

            if (prefix !== null) {
                if (prefix === "$root" || (prefix.indexOf("$root") >= 0 && prefix !== "$root")) {
                    // Has prefix with root defined? Return it.
                    return prefix;
                } else if (prefix.indexOf("$root") === -1) {
                    // Has prefix without root defined? Search for root and return combined.
                    prefix = this.getPrefix(node.parentElement) + "." + prefix;
                    this.cachePrefix(node, prefix);
                    return prefix;
                }
            } else {
                // Doesn't have prefix? Traverse up the DOM looking for one and return it.
                prefix = this.getPrefix(node.parentElement);
                this.cachePrefix(node, prefix);
                return prefix;
            }
        };

        // Cleans up prefix
        // Return prefixes without "$root" or any leading/trailing periods and whitespace
        this.getCleanPrefix = function (node) {
            return this.getPrefix(node).replace("$root", "").replace(/(^\s*\.)|(\.\s*$)/g, '');
        };

        //return the bindings given a node and the bindingContext
        this.getBindings = function (node, bindingContext) {
            var i, j, bindingAccessor, binding,
                result = {},
                value, index,
                classes = "",
                prefix = this.getCleanPrefix(node);

            if (node.nodeType === 1) {
                classes = node.getAttribute(this.attribute);
            }
            else if (node.nodeType === 8) {
                value = "" + node.nodeValue || node.text;
                index = value.indexOf(this.virtualAttribute);

                if (index > -1) {
                    classes = value.substring(index + this.virtualAttribute.length);
                }
            }

            if (classes) {
                classes = classes.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "").replace(/(\s|\u00A0){2,}/g, " ").split(' ');

                //evaluate each class, build a single object to return
                for (i = 0, j = classes.length; i < j; i++) {
                    bindingAccessor = this.bindingRouter(classes[i], this.bindings, prefix);
                    if (bindingAccessor) {
                        binding = typeof bindingAccessor == "function" ? bindingAccessor.call(bindingContext.$data, bindingContext, classes) : bindingAccessor;
                        ko.utils.extend(result, binding);
                    }
                }
            }
            else if (this.fallback) {
                result = existingProvider.getBindings(node, bindingContext);
            }

            return result;
        };
    };

    if (!exports) {
        ko.classBindingProvider = classBindingsProvider;
    }

    return classBindingsProvider;
}));