# example

This is a small demo showing the design pattern and the general usage of commands with van_dml
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
This adds style definitions dynamically to the page. This is only to demonstrate the usage, the same definition could have been inserted in the \<style\>-tag in the head.

Adding elements to the page

```JS
    begin(document.body)
	   // some tag functions here
	end()
```
`begin(el)` opens an element `el` for adding new elements. All elements created with VanJS after begin() will be appended to the selected element. `end()` returns to the previous used element or - if non was selected - finishes the append mode. 

```JS
    begin(document.body) // open document
	    ...
		begin(div(...))  // create div and open for append
        ...
    end(2);				 // return twice
	
	if (sp() !== 0) alert("SP-Error")
```
End can get a number to be executed multiple times. `sp()` returns the current stackpointer. Should be zero at the end of Javascript code.

The following code creates a user defined element - a rounded button. Styles are added manually to allow the use of style-attributes (see below)
```JS
    const rbutton = (...args) => {
      let b = button(...args)
      b.style.borderRadius = "50vh"
      return b
    }
	
    rbutton({ style: "margin: 3px;" }, `Button ${i}`).onclick = () => alert(`Button ${i} pressed`)
```
onclick is applied to the button externally, which is often convenient. It was also possible to use this definition:
```JS
    rbutton({ style: "margin: 3px;", onclick: "() => alert(`Button ${i} pressed`)" }, `Button ${i}`)
```

