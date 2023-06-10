## Example for the DML-style provided by van_dml.js

Just include the `van_dml.js` script after vanJS to enable the new functionality. (ES6-module version will be provided soon):
```HTML
  <script src="van-0.11.10.nomodule-min.js"></script>
  <script src="van_dml.js"></script>
```

### Apply CSS dynamically:
```JS
    css(`body {
      background-image: linear-gradient(0deg, #6ac 0%, #eff 100%);
      background-attachment: fixed;
      background-size: 100% 100vh;
      padding: 20px;
      text-align: center;
      font-family: helvetica;
    }`)
```
This is just for demonstration purpose, how to use css(). The same rule definition could have used in the \<style\>-tag in the head

### Auto-append feature
```JS
    begin(document.body)
    end();
```
`begin(el)` opens a DOM element `el` for writing. New elements created with a tag-function will be appended automatically as a child of this element. `el` can be any existing element, the "ID" of an element of even the document.body. In the example, the whole document was created using auto-append.

Calls of `begin() / end()´ can be nested. To shorten the code, multiple calls of end can be done in one call. 
```JS
    begin(document.body)
      begin(div())
    end(2);
    if (sp() !== 0) alert("SP-Error")
```
`sp()` returns the stack pointer. It should be zero at the end of the document to ensure, that all elements have been closed properly.


### Function as templates
```JS
    const rbutton = (...args) => {
      let b = button(...args)
      b.style.borderRadius = "50vh"
      return b
    }
    
    rbutton({ style: "margin: 3px;" }, `Button ${i}`).onclick = () => alert(`Button ${i} pressed`)
```
reusable new "tags" can be created using simple functions. `rbutton()` creates a rounded button. The necessary difinitions are applied manually via b.style.xxx to allow further formatting through attributes. 

The click-event is added externally to the DOM-reference returned by rbutton. This is often more convenient, but can also be applied like this:
```JS
    rbutton({ style: "margin: 3px;",  onclick: `() => alert("Button ${i} pressed")` }, `Button ${i}`)
```

### The result shold look like this

each button should show an alert with it´s number

![IMG06-10-23 11-36-24](https://github.com/efpage/van/assets/29945129/53795149-39e5-4639-9f67-e49e085b138f)

