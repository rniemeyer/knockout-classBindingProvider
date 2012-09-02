describe("knockout-classBindingProvider", function() {
    var instance;

    beforeEach(function() {
        instance = new ko.classBindingProvider();
    });

    it("should create the binding provider", function() {
       expect(ko.classBindingProvider).toBeDefined();
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
    });

    describe("getBindings", function() {
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

                    expect(instance.getBindings(div)).toEqual(instance.bindings.one);
                });

                it("should execute the binding with the data as the value of 'this'", function() {
                    var valueOfThis, data = {};

                    instance.bindings.one = function(context) {
                        valueOfThis = this;
                    };

                    instance.getBindings(div, { $data: data });

                    expect(valueOfThis).toEqual(data);
                });

                it("should pass the context as the only argument when executing the binding", function() {
                    var bindingSpy = jasmine.createSpy('binding'), context = { $data: {} };

                    instance.bindings.one = bindingSpy;

                    instance.getBindings(div, context);

                    expect(bindingSpy).toHaveBeenCalledWith(context);
                });

                it("should ignore a class that does not exist in the bindings for an element", function() {
                    expect(ko.toJSON(instance.getBindings(div))).toEqual("{}");
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

                    expect(instance.getBindings(comment)).toEqual(instance.bindings.one);
                });

                it("should execute the binding with the data as the value of 'this'", function() {
                    var valueOfThis, data = {};

                    instance.bindings.one = function(context) {
                        valueOfThis = this;
                    };

                    instance.getBindings(comment, { $data: data });

                    expect(valueOfThis).toEqual(data);
                });

                it("should pass the context as the only argument when executing the binding", function() {
                    var bindingSpy = jasmine.createSpy('binding'), context = { $data: {} };

                    instance.bindings.one = bindingSpy;

                    instance.getBindings(comment, context);

                    expect(bindingSpy).toHaveBeenCalledWith(context);
                });

                it("should ignore a class that does not exist in the bindings for a comment", function() {
                    expect(ko.toJSON(instance.getBindings(comment))).toEqual("{}");
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

                    expect(ko.toJSON(instance.getBindings(div))).toEqual(ko.toJSON({ text: "test", visible: true }));
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

                    instance.getBindings(div, { $data: data });

                    expect(valueOfThisOne).toEqual(data);
                    expect(valueOfThisTwo).toEqual(data);
                });

                it("should pass the context as the only argument when executing the binding", function() {
                    var bindingSpyOne = jasmine.createSpy('bindingOne'),
                        bindingSpyTwo = jasmine.createSpy('bindingTwo'),
                        context = { $data: {} };

                    div.setAttribute("data-class", "one two");

                    instance.bindings.one = bindingSpyOne;
                    instance.bindings.two = bindingSpyTwo;

                    instance.getBindings(div, context);

                    expect(bindingSpyOne).toHaveBeenCalledWith(context);
                    expect(bindingSpyTwo).toHaveBeenCalledWith(context);
                });

                it("should ignore a single class that does not exist from the list of classes for an element", function() {
                    div.setAttribute("data-class", "one three");

                    instance.bindings = {
                        one: { text: "test" },
                        two: { visible: true }
                    };

                    expect(ko.toJSON(instance.getBindings(div))).toEqual(ko.toJSON({ text: "test" }));
                });

                it("should properly ignore a case where all bindings do not exist", function() {
                    div.setAttribute("data-class", "three four");

                    instance.bindings = { one: { text: "test" }, two: { visible: true } };
                    expect(ko.toJSON(instance.getBindings(div))).toEqual("{}");
                });
            });

            describe("for comments", function() {
                it("should return the appropriate bindings for a comment", function() {
                    var comment = document.createComment("ko class: one two");

                    instance.bindings = { one: { text: "test" }, two: { visible: true } };
                    expect(ko.toJSON(instance.getBindings(comment))).toEqual(ko.toJSON({ text: "test", visible: true }));
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

                    instance.getBindings(comment, { $data: data });

                    expect(valueOfThisOne).toEqual(data);
                    expect(valueOfThisTwo).toEqual(data);
                });

                it("should pass the context as the only argument when executing the binding", function() {
                    var bindingSpyOne = jasmine.createSpy('bindingOne'),
                        bindingSpyTwo = jasmine.createSpy('bindingTwo'),
                        context = { $data: {} },
                        comment = document.createComment("ko class: one two");

                    instance.bindings.one = bindingSpyOne;
                    instance.bindings.two = bindingSpyTwo;

                    instance.getBindings(comment, context);

                    expect(bindingSpyOne).toHaveBeenCalledWith(context);
                    expect(bindingSpyTwo).toHaveBeenCalledWith(context);
                });

                it("should ignore a single class that does not exist from the list of classes for an element", function() {
                    var comment = document.createComment("ko class: one three");

                    instance.bindings = {
                        one: { text: "test" },
                        two: { visible: true }
                    };

                    expect(ko.toJSON(instance.getBindings(comment))).toEqual(ko.toJSON({ text: "test" }));
                });

                it("should properly ignore a case where all bindings do not exist", function() {
                    var comment = document.createComment("ko class: three four");

                    instance.bindings = { one: { text: "test" }, two: { visible: true } };
                    expect(ko.toJSON(instance.getBindings(comment))).toEqual("{}");
                });
            });
        });
    });

    describe("when Knockout uses this binding provider", function() {
        beforeEach(function() {
           ko.bindingProvider.instance = instance;
        });

        describe("for elements", function() {
            it("should execute the appropriate bindings", function() {
                var div = document.createElement("div");

                div.setAttribute("data-class", "one two");

                instance.bindings = {
                    one: { text: "test" },
                    two: { visible: true }
                };
                
                ko.applyBindings({}, div);
                expect(div.innerText || div.textContent).toEqual("test");
                expect(div.style.display).toBeFalsy();
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
});