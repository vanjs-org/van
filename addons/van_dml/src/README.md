# van_dml.js: Add Auto-Append feature to VanJS

van_dml.js adds a a new flavour of composition to VanJS. This is heavily inspired by the [DML](https://github.com/efpage/dml)-framework for dynamic page creation.

Van_DML adds two main functions to VanJS.js. You can enable some new fuctions using
```JS
    const { h1, h2, div, p, button } = van.tags;
    const { begin, end, base, sp, css } = van
```
`begin(ID)` selects an element as a base. All elements created after begin() are automatically appended as childs to this object.
`begin(div)`creates a new div and opens it for Auto-Append.
`end() finishes the appending

begin and end feature a call stack, so the can be nested like this:
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

