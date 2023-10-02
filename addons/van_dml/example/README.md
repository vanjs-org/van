# Example

This is a  demo showing the design pattern and the usage of the commands introduced by van_dml.

To use van_dml, include the script right after VanJS (an ES6-module will come soon).
```HTML
<script src="van-latest.nomodule-min.js"></script>
<script src="van_dml.js"></script>
```
if you want to load the modules from a cdn, you can use:
```HTML
<script src="https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-latest.nomodule.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/vanjs-org/van/addons/van_dml/src/van_dml.js"></script>
```
van_dml.js extends the `tag`-function of `van` and introduces some new functions.
```JS
    const { h1, h2, div, p, button } = van.tags; // some HTML-tags
    const { begin, end, base, sp, css } = van    // new functions introduced by van_dml
```

### css(s)
This adds dynamic style definitions to the page. The example is only to demonstrate the usage, the same definition could have been inserted in the \<style\>-tag in the head. Definitions can be introduced or replaced with this command.
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
Dynamic CSS can be used to create responsive pages with ease. Just use JS to select, which CSS should be applied.

### Auto-append with `begin()` and `end()`

begin opens any DOM element for writing. Elements created between `begin()` and `end()` will be automatic appended as a child to the object selected with `begin(el)`
```JS
    begin(document.body)
    // some tag functions here
    end()
```
`end()` returns to the previous used element or - if non was selected - finishes the append mode. Calls of `begin() ... end()` can be nested:

```JS
    begin(document.body) // open document
    ...
  	begin(div(...))  // create div and open for append
    ...

    end(2);  // close all open appends
    if (sp() !== 0) alert("SP-Error") // check the stack pointer, should be zero at the end
```
End can be executed multiple times by adding a number as a parameter. `sp()` returns the current stackpointer. Should be zero at the end of Javascript code.

### Functional templates

The following code creates a user defined element - a rounded button. Styles are added directly to the DOM to allow the use of style-attributes in the arguments (see below)
```JS
    const rbutton = (...args) => {
      let b = button(...args)
      b.style.borderRadius = "50vh"
      return b
    }

    rbutton({ style: "margin: 3px;" }, `Button ${i}`).onclick = () => alert(`Button ${i} pressed`)
```
onclick is applied to the button externally, which is convenient. It was also possible to use this definition to get the same result:
```JS
    rbutton({ style: "margin: 3px;", onclick: "() => alert(`Button ${i} pressed`)" }, `Button ${i}`)
```

### Result

The result should look like follows. Each button should return it´s number with an alert.
![IMG06-10-23 11-36-24](https://github.com/efpage/van/assets/29945129/4ba3191d-356a-45e0-9d6b-97252780b234)


### css(s)

This adds dynamic style definitions to the page. The example is only to demonstrate the usage, the same definition could have been inserted in the \<style\>-tag in the head. Definitions can be introduced or replaced with this command.
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
Dynamic CSS can be used to create responsive pages with ease. Just use JS to select, which CSS should be applied.


