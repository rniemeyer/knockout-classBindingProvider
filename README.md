knockout-classBindingProvider
================
*knockout-classBindingProvider* is a [Knockout.js](http://knockoutjs.com/) plugin that changes the way that Knockout discovers and parses bindings on elements. With this library, Knockout will look for a `data-class` attribute (by default) and use its value to key into a JavaScript object containing definitions for each binding. This let's you move your bindings specifications out of the markup and into a layer of JavaScript code.

This library uses the `bindingProvider` extensibility point found in Knockout 2.0+. A description of this functionality and the origin of this implementation can be found in this blog [post](http://www.knockmeout.net/2011/09/ko-13-preview-part-2-custom-binding.html).

What are the benefits of this approach?
---------------------------------------

* The markup can stay clean and simple
* Bindings can be re-used, even at different scopes
* You can set breakpoints in the bindings to inspect the data being passed through them
* You can do logging in the bindings to understand how many times they are being called
* You can change/alter the bindings on an element whenever your bindings are triggered
* Bindings go through less parsing (do not need to go from an object literal in a string to code)

Basic Usage
-----------
To get started, reference the `knockout-classBindingProvider.min.js` script after Knockout.js

In your code, prior to calling `ko.applyBindings`, tell Knockout that you want to use a new binding provider.

```js
//bindings - a JavaScript object containing binding definitions
//options - an object that can contain these properties:
//  attribute - override the attribute used for bindings (defaults to `data-class`)
//  virtualAttribute - override the text used for virtual bindings (defaults to `class` and specified as `ko class:`)
//  bindingRouter - custom function for routing class names to the appropriate binding
//  fallback - look for normal `data-bind` bindings after failing with this provider on an element (defaults to false)
ko.bindingProvider.instance = new ko.classBindingProvider(bindings, options);
```

Sample bindings object:

```js
var bindings = {
    title: function(context, classes) {
        return {
            value: this.title,
            enable: context.$parent.editable
        }
    },
    input: {
        valueUpdate: 'afterkeydown'
    },
    list: {
        items: function(context, classes) {
            return {
                foreach: this.items
            }
        }
    }
};
```

In the example, the `title` binding class uses a function that is given the binding context and an array containing all of the binding classes listed on the element. The value of `this` is also set to the current data (`context.$data`) to make it easy to access its properties. The function needs to return the bindings that should be used for the element. Alternatively, you can specify a static value like in the `input` binding class where the resulting bindings can be determined at design time, without the need for the current context.

Then, you would use these bindings like:

```html
<input data-class="title input" />
```

You can also use it in a virtual binding like:

```html
<!-- ko class: items -->
<div data-class="name"></div>
<!-- /ko -->
```

Similar to CSS classes, you can list multiple keys and the resulting bindings will be combined for the element. By default, a binding class can follow an object tree by writing the property path separated by periods.  Using the bindings object above, you can do:

```html
<ul data-class="list.items">
	<li> ... </li>
</ul>
```

Also, when using a function for a binding class, the second argument passed to the function will be an array containing all of the binding classes listed on the element. These classes can even be treated as modifiers or dynamic values when generating the bindings, as each binding class does not have to actually exist in the bindings object.

At run-time, you can also access the bindings, by using `ko.bindingProvider.instance.bindings`.  This allows you to add and remove bindings as your application needs them. You can also merge a new set of bindings into the existing bindings using `ko.bindingProvider.instance.registerBindings(newBindings);`.

To use your own binding router, set `options.bindingRouter = function(class, bindings){...}`.  `class` is the current class being requested and `bindings` is provider's current bindings object.  Be sure to return a valid binding object.

Dependencies
------------
* Knockout 2.0+

Build
-----
This project uses anvil.js (see http://github.com/appendto/anvil.js) for building/minifying.

Examples
--------
The examples folder has small samples for normal and AMD usage. Here is the non-AMD sample in jsFiddle: <http://jsfiddle.net/rniemeyer/LvwRt/>.

License
-------
MIT [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)