describe("knockout-classBindingProvider", function() {
    var instance;

    beforeEach(function() {
        instance = new ko.classBindingProvider();
    });

    it("should create the binding provider", function() {
       expect(ko.classBindingProvider).toBeDefined();
    });

    describe("constructing a classBindingProvider", function() {
        it("should read the bindings object", function() {
            var bindings = {
                one: {
                    text: 'test'
                }
            };

            instance = new ko.classBindingProvider(bindings);

            expect(instance.bindings).toEqual(bindings);
        });

        it("should use a default attribute of 'data-class'", function() {
            expect(instance.attribute).toEqual("data-class");
        });

        it("should use a default fallback value of false", function() {
            expect(instance.fallback).toBeFalsy();
        });

        it("should respect an override attribute", function() {
            instance = new ko.classBindingProvider({}, { attribute: "data-test" });
            expect(instance.attribute).toEqual("data-test");
        });

        it("should respect an override virtual attribute", function() {
            instance = new ko.classBindingProvider({}, { virtualAttribute: "test" });
            expect(instance.virtualAttribute).toEqual("ko test:");
        });

        it("should respect an override fallback value", function() {
            instance = new ko.classBindingProvider({}, { fallback: true });
            expect(instance.fallback).toBeTruthy();
        })
    });

    describe("nodeHasBindings", function() {
        it("should identify elements with data-class", function() {
            var div = document.createElement("div");
            div.setAttribute("data-class", "one");

            expect(instance.nodeHasBindings(div)).toBeTruthy();
        });

        it("should not identify elements that do not have a data-class attribute", function() {
            var div = document.createElement("div");
            div.setAttribute("data-bind", "one");

            expect(instance.nodeHasBindings(div)).toBeFalsy();
        });

        it("should identify comments with ko class:", function() {
            var comment = document.createComment("ko class: one");
            expect(instance.nodeHasBindings(comment)).toBeTruthy();
        });

        it("should not identify comments that do not have ko class:", function() {
            var comment = document.createComment("ko with: one");
            expect(instance.nodeHasBindings(comment)).toBeFalsy();
        });

        it("should identify elements with a custom attribute name", function() {
            var div = document.createElement("div");
            div.className = "one";
            instance.attribute = "class";

            expect(instance.nodeHasBindings(div)).toBeTruthy();
        });

        it("should identify comments with a custom virtual attribute name", function() {
            var comment = document.createComment("ko test: one");
            instance.virtualAttribute = "ko test:";

            expect(instance.nodeHasBindings(comment)).toBeTruthy();
        });

        it("should identify elements with data-bind attributes when fallback is true", function() {
            var div = document.createElement("div");
            div.setAttribute("data-bind", "text: one");
            instance.fallback = true;

            expect(instance.nodeHasBindings(div)).toBeTruthy();
        });
    });

    describe("getBindingAccessors", function() {
        describe("when using a single class", function() {
            describe("for elements", function() {
                var div;
                beforeEach(function() {
                    div = document.createElement("div");
                    div.setAttribute("data-class", "one");
                });

                it("should return the appropriate bindings for an element", function() {
                    instance.bindings.one = {
                        text: "test",
                        visible: true
                    };

                    expect(instance.getBindingAccessors(div).text()).toEqual("test");
                    expect(instance.getBindingAccessors(div).visible()).toEqual(true);
                });

                it("should execute the binding with the data as the value of 'this'", function() {
                    var valueOfThis, data = {};

                    instance.bindings.one = function(context) {
                        valueOfThis = this;
                    };

                    instance.getBindingAccessors(div, { $data: data });

                    expect(valueOfThis).toEqual(data);
                });

                it("should pass appropriate arguments when executing the binding", function() {
                    var bindingSpy = jasmine.createSpy('binding'), context = { $data: {} };

                    instance.bindings.one = bindingSpy;

                    instance.getBindingAccessors(div, context);

                    expect(bindingSpy).toHaveBeenCalled();
                    expect(bindingSpy.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpy.mostRecentCall.args[1][0]).toEqual("one");
                });

                it("should ignore a class that does not exist in the bindings for an element", function() {
                    expect(ko.toJSON(instance.getBindingAccessors(div))).toEqual("{}");
                });

                it("should return the appropriate bindings when using a custom attribute", function() {
                    instance.bindings.one = {
                        text: "test",
                        visible: true
                    };

                    instance.attribute = "data-test";

                    div = document.createElement("div");
                    div.setAttribute("data-test", "one");

                    expect(instance.getBindingAccessors(div).text()).toEqual("test");
                    expect(instance.getBindingAccessors(div).visible()).toEqual(true);
                });
            });

            describe("for comments", function() {
                var comment;

                beforeEach(function() {
                    comment = document.createComment("ko class: one");
                });

                it("should return the appropriate bindings for a comment", function() {
                    instance.bindings.one = {
                        text: "test",
                        visible: true
                    };

                    expect(instance.getBindingAccessors(comment).text()).toEqual("test");
                    expect(instance.getBindingAccessors(comment).visible()).toEqual(true);
                });

                it("should execute the binding with the data as the value of 'this'", function() {
                    var valueOfThis, data = {};

                    instance.bindings.one = function(context) {
                        valueOfThis = this;
                    };

                    instance.getBindingAccessors(comment, { $data: data });

                    expect(valueOfThis).toEqual(data);
                });

                it("should pass appropriate arguments when executing the binding", function() {
                    var bindingSpy = jasmine.createSpy('binding'), context = { $data: {} };

                    instance.bindings.one = bindingSpy;

                    instance.getBindingAccessors(comment, context);

                    expect(bindingSpy).toHaveBeenCalled();
                    expect(bindingSpy.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpy.mostRecentCall.args[1][0]).toEqual("one");
                });

                it("should ignore a class that does not exist in the bindings for a comment", function() {
                    expect(ko.toJSON(instance.getBindingAccessors(comment))).toEqual("{}");
                });

                it("should return the appropriate bindings when using a custom virtual attribute", function() {
                    instance.bindings.one = {
                        text: "test",
                        visible: true
                    };

                    instance.virtualAttribute = "ko test:";
                    comment = document.createComment("ko test: one");

                    expect(instance.getBindingAccessors(comment).text()).toEqual("test");
                    expect(instance.getBindingAccessors(comment).visible()).toEqual(true);
                });
            });
        });

        describe("when using multiple classes", function() {
            describe("for elements", function() {
                var div;

                beforeEach(function() {
                    div = document.createElement("div");
                });

                it("should return the appropriate bindings", function() {
                    div.setAttribute("data-class", "one two");

                    instance.bindings = {
                        one: { text: "test" },
                        two: { visible: true }
                    };

                    expect(instance.getBindingAccessors(div).text()).toEqual("test");
                    expect(instance.getBindingAccessors(div).visible()).toEqual(true);
                });

                it("should execute the binding with the data as the value of 'this'", function() {
                    var valueOfThisOne, valueOfThisTwo,
                        data = {};

                    div.setAttribute("data-class", "one two");

                    instance.bindings.one = function(context) {
                        valueOfThisOne = this;
                    };

                    instance.bindings.two = function(context) {
                        valueOfThisTwo = this;
                    };

                    instance.getBindingAccessors(div, { $data: data });

                    expect(valueOfThisOne).toEqual(data);
                    expect(valueOfThisTwo).toEqual(data);
                });

                it("should pass appropriate arguments when executing the binding", function() {
                    var bindingSpyOne = jasmine.createSpy('bindingOne'),
                        bindingSpyTwo = jasmine.createSpy('bindingTwo'),
                        context = { $data: {} };

                    div.setAttribute("data-class", "one two");

                    instance.bindings.one = bindingSpyOne;
                    instance.bindings.two = bindingSpyTwo;

                    instance.getBindingAccessors(div, context);

                    expect(bindingSpyOne).toHaveBeenCalled();
                    expect(bindingSpyOne.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpyOne.mostRecentCall.args[1][0]).toEqual("one");
                    expect(bindingSpyOne.mostRecentCall.args[1][1]).toEqual("two");

                    expect(bindingSpyTwo).toHaveBeenCalled();
                    expect(bindingSpyTwo.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpyTwo.mostRecentCall.args[1][0]).toEqual("one");
                    expect(bindingSpyTwo.mostRecentCall.args[1][1]).toEqual("two");
                });

                it("should ignore extra whitespace", function() {
                    var bindingSpyOne = jasmine.createSpy('bindingOne'),
                        bindingSpyTwo = jasmine.createSpy('bindingTwo'),
                        context = { $data: {} };

                    div.setAttribute("data-class", "           one         two               ");

                    instance.bindings.one = bindingSpyOne;
                    instance.bindings.two = bindingSpyTwo;

                    instance.getBindingAccessors(div, context);

                    expect(bindingSpyOne).toHaveBeenCalled();
                    expect(bindingSpyOne.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpyOne.mostRecentCall.args[1][0]).toEqual("one");
                    expect(bindingSpyOne.mostRecentCall.args[1][1]).toEqual("two");
                    expect(bindingSpyOne.mostRecentCall.args[1].length).toEqual(2);

                    expect(bindingSpyTwo).toHaveBeenCalled();
                    expect(bindingSpyTwo.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpyTwo.mostRecentCall.args[1][0]).toEqual("one");
                    expect(bindingSpyTwo.mostRecentCall.args[1][1]).toEqual("two");
                    expect(bindingSpyTwo.mostRecentCall.args[1].length).toEqual(2);
                });

                it("should ignore a single class that does not exist from the list of classes for an element", function() {
                    div.setAttribute("data-class", "one three");

                    instance.bindings = {
                        one: { text: "test" },
                        two: { visible: true }
                    };

                    expect(instance.getBindingAccessors(div).text()).toEqual("test");
                    expect(instance.getBindingAccessors(div).visible).toBeUndefined;
                });

                it("should properly ignore a case where all bindings do not exist", function() {
                    div.setAttribute("data-class", "three four");

                    instance.bindings = { one: { text: "test" }, two: { visible: true } };
                    expect(ko.toJSON(instance.getBindingAccessors(div))).toEqual("{}");
                });
            });

            describe("for comments", function() {
                it("should return the appropriate bindings for a comment", function() {
                    var comment = document.createComment("ko class: one two");

                    instance.bindings = { one: { text: "test" }, two: { visible: true } };
                    expect(instance.getBindingAccessors(comment).text()).toEqual("test");
                    expect(instance.getBindingAccessors(comment).visible()).toEqual(true);
                });

                it("should execute the binding with the data as the value of 'this'", function() {
                    var valueOfThisOne, valueOfThisTwo,
                        data = {},
                        comment = document.createComment("ko class: one two");

                    instance.bindings.one = function(context) {
                        valueOfThisOne = this;
                    };

                    instance.bindings.two = function(context) {
                        valueOfThisTwo = this;
                    };

                    instance.getBindingAccessors(comment, { $data: data });

                    expect(valueOfThisOne).toEqual(data);
                    expect(valueOfThisTwo).toEqual(data);
                });

                it("should pass appropriate arguments when executing the binding", function() {
                    var bindingSpyOne = jasmine.createSpy('bindingOne'),
                        bindingSpyTwo = jasmine.createSpy('bindingTwo'),
                        context = { $data: {} },
                        comment = document.createComment("ko class: one two");

                    instance.bindings.one = bindingSpyOne;
                    instance.bindings.two = bindingSpyTwo;

                    instance.getBindingAccessors(comment, context);

                    expect(bindingSpyOne).toHaveBeenCalled();
                    expect(bindingSpyOne.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpyOne.mostRecentCall.args[1][0]).toEqual("one");
                    expect(bindingSpyOne.mostRecentCall.args[1][1]).toEqual("two");

                    expect(bindingSpyTwo).toHaveBeenCalled();
                    expect(bindingSpyTwo.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpyTwo.mostRecentCall.args[1][0]).toEqual("one");
                    expect(bindingSpyTwo.mostRecentCall.args[1][1]).toEqual("two");
                });

                it("should ignore extra whitespace", function() {
                    var bindingSpyOne = jasmine.createSpy('bindingOne'),
                        bindingSpyTwo = jasmine.createSpy('bindingTwo'),
                        context = { $data: {} },
                        comment = document.createComment("ko class:             one            two              ");

                    instance.bindings.one = bindingSpyOne;
                    instance.bindings.two = bindingSpyTwo;

                    instance.getBindingAccessors(comment, context);

                    expect(bindingSpyOne).toHaveBeenCalled();
                    expect(bindingSpyOne.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpyOne.mostRecentCall.args[1][0]).toEqual("one");
                    expect(bindingSpyOne.mostRecentCall.args[1][1]).toEqual("two");
                    expect(bindingSpyOne.mostRecentCall.args[1].length).toEqual(2);

                    expect(bindingSpyTwo).toHaveBeenCalled();
                    expect(bindingSpyTwo.mostRecentCall.args[0]).toEqual(context);
                    expect(bindingSpyTwo.mostRecentCall.args[1][0]).toEqual("one");
                    expect(bindingSpyTwo.mostRecentCall.args[1][1]).toEqual("two");
                    expect(bindingSpyTwo.mostRecentCall.args[1].length).toEqual(2);
                });

                it("should ignore a single class that does not exist from the list of classes for an element", function() {
                    var comment = document.createComment("ko class: one three");

                    instance.bindings = {
                        one: { text: "test" },
                        two: { visible: true }
                    };

                    expect(instance.getBindingAccessors(comment).text()).toEqual("test");
                    expect(instance.getBindingAccessors(comment).visible).toBeUndefined();
                });

                it("should properly ignore a case where all bindings do not exist", function() {
                    var comment = document.createComment("ko class: three four");

                    instance.bindings = { one: { text: "test" }, two: { visible: true } };
                    expect(ko.toJSON(instance.getBindingAccessors(comment))).toEqual("{}");
                });
            });
        });
    });

    describe("registerBindings", function() {
        beforeEach(function() {
            instance.bindings = {
                one: { text: "test" },
                two: { visible: true }
            };
        });

        it("should add bindings to the existing bindings", function() {
            instance.registerBindings({
                three: {
                    enabled: false
                },
                four: {
                    css: {
                        active: true
                    }
                }
            });

            expect(ko.toJSON(instance.bindings.one)).toEqual(ko.toJSON({
                text: "test"
            }));

            expect(ko.toJSON(instance.bindings.two)).toEqual(ko.toJSON({
                visible: true
            }));

            expect(ko.toJSON(instance.bindings.three)).toEqual(ko.toJSON({
                enabled: false
            }));

            expect(ko.toJSON(instance.bindings.four)).toEqual(ko.toJSON({
                css: {
                    active: true
                }
            }));
        });
    });

    describe("default bindingRouter", function() {
        beforeEach(function() {
            instance.bindings = {
                one: {
                    two: {
                        three: {
                            text: "match on sub properties"
                        }
                    }
                },
                "one.two.three.four": {
                    text: "match directly"
                }
            };
        });

        it("should follow binding path and find the binding", function() {
            expect(instance.bindingRouter("one.two.three", instance.bindings).text).toEqual("match on sub properties");
        });

        it("should match a property directly, even if it contains periods", function() {
            expect(instance.bindingRouter("one.two.three.four", instance.bindings).text).toEqual("match directly");
        });
    });

    describe("when Knockout uses this binding provider", function() {
        describe("with default settings", function() {
            beforeEach(function() {
                ko.bindingProvider.instance = instance;
            });

            describe("for elements", function() {
                it("should execute the appropriate bindings", function() {
                    var div = document.createElement("div");

                    div.setAttribute("data-class", "one two three.sub");

                    instance.bindings = {
                        one: { text: "test" },
                        two: { visible: true },
                        three: {
                            sub: {
                                attr: {
                                    title: "title_test"
                                }
                            }
                        }
                    };

                    ko.applyBindings({}, div);
                    expect(div.innerText || div.textContent).toEqual("test");
                    expect(div.style.display).toBeFalsy();
                    expect(div.getAttribute("title")).toEqual("title_test");
                });
            });

            describe("for comments", function() {
                it("should execute the appropriate bindings", function() {
                    var data = { testing: "test" },
                        parent = document.createElement("div"),
                        commentStart = document.createComment("ko class: one"),
                        commentEnd = document.createComment("/ko"),
                        child = document.createElement("div");

                    parent.appendChild(commentStart);
                    parent.appendChild(child);
                    parent.appendChild(commentEnd);
                    child.setAttribute("data-class", "two");

                    instance.bindings = {
                        one: { "with": data },
                        two: function(context) {
                            return { text: this.testing };
                        }
                    };

                    ko.applyBindings({}, parent);

                    expect(parent.childNodes[1].innerText || parent.childNodes[1].textContent).toEqual("test");
                });
            });
        });

        describe("with fallback true, a custom attribute, and a custom virtual attribute", function() {
            beforeEach(function() {
                ko.bindingProvider.instance = instance = new ko.classBindingProvider({}, {
                    attribute: "data-klass",
                    virtualAttribute: "klass",
                    fallback: true
                });
            });

            describe("for elements", function() {
                it("should execute the appropriate bindings", function() {
                    var div = document.createElement("div");

                    div.setAttribute("data-klass", "one two");

                    instance.bindings = {
                        one: { text: "test" },
                        two: { visible: true }
                    };

                    ko.applyBindings({}, div);

                    expect(div.innerText || div.textContent).toEqual("test");
                    expect(div.style.display).toBeFalsy();
                });

                it("should fallback to respecting data-bind attributes", function() {
                    var div = document.createElement("div");

                    div.setAttribute("data-bind", "text: 'test', visible: true");

                    ko.applyBindings({}, div);

                    expect(div.innerText || div.textContent).toEqual("test");
                    expect(div.style.display).toBeFalsy();
                });
            });

            describe("for comments", function() {
                it("should execute the appropriate bindings", function() {
                    var parent = document.createElement("div"),
                        commentStart = document.createComment("ko klass: data"),
                        commentEnd = document.createComment("/ko"),
                        child = document.createElement("div"),
                        childFallback = document.createElement("div");

                    instance.bindings = {
                        data: function() {
                            return { "with": this.data };
                        },
                        one: function() {
                            return {
                                text: this.testing
                            };
                        },
                        two: { visible: true }
                    };

                    parent.appendChild(commentStart);
                    parent.appendChild(child);
                    parent.appendChild(childFallback);
                    parent.appendChild(commentEnd);

                    child.setAttribute("data-klass", "one two");
                    childFallback.setAttribute("data-bind", "text: testing");

                    ko.applyBindings({
                        data: {
                            testing: 'test'
                        }
                    }, parent);

                    expect(parent.childNodes[1].innerText || parent.childNodes[1].textContent).toEqual("test");
                    expect(parent.childNodes[1].style.display).toBeFalsy();
                    expect(parent.childNodes[2].innerText || parent.childNodes[2].textContent).toEqual("test");

                });

                it("should fallback to the appropriate bindings", function() {
                    var parent = document.createElement("div"),
                        commentStart = document.createComment("ko with: data"),
                        commentEnd = document.createComment("/ko"),
                        child = document.createElement("div"),
                        childFallback = document.createElement("div");

                    instance.bindings = {
                        one: function() {
                            return {
                                text: this.testing
                            };
                        },
                        two: { visible: true }
                    };

                    parent.appendChild(commentStart);
                    parent.appendChild(child);
                    parent.appendChild(childFallback);
                    parent.appendChild(commentEnd);

                    child.setAttribute("data-klass", "one two");
                    childFallback.setAttribute("data-bind", "text: testing");

                    ko.applyBindings({
                        data: {
                            testing: 'test'
                        }
                    }, parent);

                    expect(parent.childNodes[1].innerText || parent.childNodes[1].textContent).toEqual("test");
                    expect(parent.childNodes[1].style.display).toBeFalsy();
                    expect(parent.childNodes[2].innerText || parent.childNodes[2].textContent).toEqual("test");
                });
            });
        });

        describe("with a custom binding router", function() {
            var router, bindings;
            beforeEach(function() {
                router = function(className, bindings) {
                    return { text: className };
                };

                bindings = {};

                ko.bindingProvider.instance = instance = new ko.classBindingProvider(bindings, {
                    bindingRouter: router
                });
            });

            it("should call a custom binding router with the correct arguments", function() {
                var div = document.createElement("div");

                spyOn(instance, "bindingRouter");

                div.setAttribute("data-class", "one");

                ko.applyBindings({}, div);

                expect(instance.bindingRouter).toHaveBeenCalledWith("one", bindings);
            });

            it("should use the return value of the custom binding router as the binding", function() {
                var div = document.createElement("div");

                div.setAttribute("data-class", "one");

                ko.applyBindings({}, div);

                expect(div.innerText || div.textContent).toEqual("one");
            });
        });
    });
});