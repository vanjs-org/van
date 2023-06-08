# van_dml.js: Auto-Append feature to VanJS

**van_dml.js** adds a a new flavour of composition to VanJS. This is heavily inspired by the [DML](https://github.com/efpage/dml)-framework for dynamic page creation.

Van_DML extends the core of VanJS. You can enable van_dml like this:
```JS
    <script src="van-latest.nomodule-min.js"></script>
    <script src="van_dml.js"></script>

    const { h1, h2, div, p, button } = van.tags;
    const { begin, end, base, sp, css } = van  // new functions of van_dml
```
## How does it work?
`begin(ID)` selects an element "ID" as a base. ID can be a DOM element or a HTML-ID. All elements created after begin() are automatically appended as childs to this object.
`end() finishes the automatic appending.

begin() and end() can be nested like this:
```JS
    const { h1, h2, div, p, button } = van.tags;
    const { begin, end, base, sp, css } = van
    
    beign(document.body)
        h1("Headline")
        begin(div({style: "border: 1px solid black"}))
          h2("Headline in a box")
          p("some text here")
        end()
    end()
```
This is similar to using plain HTML, where a tag create elements directly.

## tansparent operation of "begin()"

Van-Tags return a DOM Reference that can be stored in a variable:
```JS
    let d = div()
    d.style.color = "red"
    d.appendChild(h1("Headline");
```
With VAN_DML, this can be rewritten:
```JS
    let d = begin(div()) // -> d is the <div>-element
    begin(div()).style.color = "red" // Acess the style of div
```
begin() is "transparent", it just returns the DOM reference of the first child. This let´s you create functions like this:
```JS
    const bdiv = (...args) => begin(div(...args))
    
    bdiv() // Create a div and open for append
        h1()
    end()
```
begin(ID) can also digest Strings:
```JS
    <div id="ID"> <>
    <script>
    begin("ID") // select div by ID
        h1()
    end()
```

## end(n)

end() finishes the append mode and returns to the previous base. For each begin() there should be one call of end(). You can verify this by checking `SP() === 0` (see below). 
If no base is selected (or the calls begin() and end() are balanced), auto-Append is disabled. 

end(n) runs "end()" n times. May be convenient to return from deep nested functions.

## base() and sp()

base() returns the current base:
```JS
    begin(div()) 
    let b = base(); // returns the current base (div())
```

sp() is the current Stack-Position. Initially SP() is 0. With each call of begin() sp() is incremented, end() decements sp().
To check your code, you can add this line to the end of Javascript:
```JS
    begin(document.body) 
       .... some code here
    end()
    
    if (sp() !== 0) alert(`baseStack mismatch: stacksize ${sp()} at end of Javascript`)
```

## css(s): create CSS-Defintions dynamically with Javascript
    s can be 
     - a string css(".myClass { color: red; }") 
     - a template string with multiple rules
        css(`
          .myClass { color: red; }
          .myClass: hover { color: green }
        `)
      - It can contain even template literals: 
       let color = ["red","green","blue"]
       css(`
          .myClass { color: ${mycolor[1]}; }
        `)
Definitions with css() work like any other CSS you provide with static definitions, they just are added from within Javascript. This makes it easy to control CSS programmatically
