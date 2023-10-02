# van_dml.js: Auto-Append feature to VanJS

_Author: [Eckehard](https://github.com/efpage)_

**van_dml.js** adds a new flavour of composition to VanJS. This is heavily inspired by the [DML](https://github.com/efpage/dml)-framework for dynamic page creation.

Van_DML extends the core of VanJS. You can enable van_dml like this:
```HTML
<script src="https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-latest.nomodule.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/vanjs-org/van/addons/van_dml/src/van_dml.js"></script>

<script>
    const { h1, h2, div, p, button } = van.tags;
    const { begin, end, base, sp, css } = van  // new functions of van_dml
</script>
```
## How does it work?
`begin(ID)` selects an element "ID" as a base. ID can be a DOM element or a HTML-ID. All elements created after `begin()` are automatically appended as children to this object.
`end()` finishes the automatic appending.

`begin()` and `end()` can be nested like this:
```JS
    const { h1, h2, div, p, button } = van.tags;
    const { begin, end, base, sp, css } = van

    begin(document.body)
        h1("Headline")
        begin(div({style: "border: 1px solid black"}))
            h2("Headline in a box")
            p("some text here")
        end()
    end()
```
This is similar to using plain HTML, where a tag create elements directly.

## transparent operation of "begin()"

Van-Tags return a DOM Reference that can be stored in a variable:
```JS
    let d = div()
    d.style.color = "red"
    d.appendChild(h1("Headline");
```
With VAN_DML, this can be rewritten:
```JS
    let d = begin(div()) // -> d is the <div>-element
    begin(div()).style.color = "red" // Access the style of div
```
`begin()` is "transparent", it just returns the DOM reference of the first child. This let´s you create functions like this:
```JS
    const bdiv = (...args) => begin(div(...args))
    
    bdiv() // Create a div and open for append
        h1()
    end()
```
begin(ID) can also digest Strings:
```JS
    <div id="ID"></div>
    <script>
    begin("ID") // select div by ID
        h1()
    end()
    </script>
```

## end(n)

`end()` finishes the append mode and returns to the previous base. For each `begin()` there should be one call of `end()`. You can verify this by checking `SP() === 0` (see below). 
If no base is selected (or the calls `begin()` and `end()` are balanced), auto-Append is disabled. 

end(n) runs `end()` n times. May be convenient to return from deep nested functions.

## base() and sp()

base() returns the current base:
```JS
    begin(div()) 
    let b = base(); // returns the current base (div())
```

sp() is the current Stack-Position. Initially sp() is 0. With each call of `begin()` sp() is incremented, `end()` decrements sp().
To check your code, you can add this line to the end of Javascript:
```JS
    begin(document.body) 
       .... some code here
    end()
    
    if (sp() !== 0) alert(`baseStack mismatch: stacksize ${sp()} at end of Javascript`)
```

## css(): create CSS-rules dynamically with Javascript

`css(s)` adds new CSS-rules during runtime.  
s can be 
- a string css(".myClass { color: red; }") 
- a template string with multiple rules
```JS
    css(`
        .myClass { color: red; }
        .myClass: hover { color: green }
    `)
 ```
 - It can contain template literals: 
 ```JS
    let color = [ "red", "green", "blue" ]
    css(`
        .myClass { color: ${mycolor[1]}; }
    `)
```
If a rule already exists, it will be overwritten by the new definition. Results are immediately shown by the browser. Definitions with css() work like any other CSS you provide with static definitions, they just are added from within Javascript. This makes it easy to control CSS programmatically. css can be used anywhere and anytime in the script. New css-rules will become active immediately and might even be changed as shown in the example below:
```JS
    const { button } = van.tags
    const { add, css } = van
        add(document.body,
        button({onclick: () => css(".class1 {background-color: red;}")},"set class1 red"),
        button({onclick: () => css(".class1 {background-color: green;}")},"set class1 green")
    );
```
**!Attention:**: css() adds new rules to the first stylesheet (`window.document.styleSheets[0]`). If the first stylesheet was loaded from an external source, this may cause CORS errors. For more information see [here](https://davidwalsh.name/add-rules-stylesheets) and [here](https://stackoverflow.com/questions/49088507/cannot-access-rules-in-external-cssstylesheet). Always add a ***local CSS-file*** first, as the dynamic rules are included in the first style sheet.

## Support

If you need support, please use the [Discussions](https://github.com/vanjs-org/van/discussions) page.
