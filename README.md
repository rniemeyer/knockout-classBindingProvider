knockout-classBindingProvider
================
*knockout-classBindingProvider* is a [Knockout.js](http://knockoutjs.com/) plugin that changes the way that Knockout discovers and parses bindings on elements. With this library, Knockout will, by default, look for a `data-class` attribute and use its value to key into a JavaScript object containing definitions for each binding. This let's you move your bindings specifications out of the markup and into a layer of JavaScript code.

This library uses the `bindingProvider` extensibility point found in Knockout 2.0+. A description of this functionality and the origin of this implementation can be found in this blog [post](http://www.knockmeout.net/2011/09/ko-13-preview-part-2-custom-binding.html).

What are the benefits of this approach?
---------------------------------------

* The markup can stay clean and simple
* Bindings can be re-used, even at different scopes
* You can set breakpoints in the bindings to inspect the data being passed through them
* You can do logging in the bindings to understanding how many times they are being called
* You can change/alter the bindings on an element whenever your bindings are triggered
* Bindings go through less parsing (do not need to go from a object literal in a string to code)

Basic Usage
-----------
To get started, reference the `knockout-classBindingProvider.min.js` script after Knockout.js

In your code, prior to calling `ko.applyBindings`, tell Knockout that you want to use a new binding provider.

```js
//bindings is a JavaScript object containing binding definitions
//attribute defaults to "data-class", but can be overriden
ko.bindingProvider.instance = new ko.classBindingProvider(bindings, attribute);
```

Sample bindings object:

```js
var bindings = {
    title: function(context) {
        return {
            value: this.title,
            enable: context.$parent.editable
        }
    },
    input: {
        valueUpdate: 'afterkeydown'
    }
};
```

In the example, the `title` binding class uses a function that is given the binding context as its only argument. The value of `this` is also set to the current data (`context.$data`) to make it easy to access its properties. The function needs to return the bindings that should be used for the element. Alternatively, you can specify a static value like in the `input` binding class where the resulting bindings can be determined now without the need for the current context.

Then, you would use these bindings like:

```html
<input data-class="title input" />
```

Similar to CSS classes, you can list multiple keys and the resulting bindings will be combined for the element.

At run-time, you can also access the bindings, by using `ko.bindingProvider.instance.bindings`.  This allows you to add and remove bindings as your application needs them.

Dependencies
------------
* Knockout 2.0+

Build
-----
This project uses anvil.js (see http://github.com/arobson/anvil.js) for building/minifying.

Examples
--------
The examples folder has small samples for normal and AMD usage.

License
-------
MIT [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)