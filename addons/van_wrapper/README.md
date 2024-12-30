# Van Wrapper

_Author : [zakarialaoui10](https://github.com/zakarialaoui10)

## Description :

Van-Wrapper is a tool that makes it easy to render VanJS elements within other popular frameworks.

## Main repository : 

https://github.com/zakarialaoui10/van-wrapper


## Usage

### *Component Declaration :*
```js
// HelloFromVan.js
import { VanWrapper } from "van-wrapper/vue";
const {a, p, div} = van.tags
const HelloFromVan = ({environement}) => div(
  p(message, a({href: "https://vanjs.org/"}, "VanJS")),
  p(
    "This is a ",
    a({href: "https://vanjs.org/"}, "VanJS "),
    `Element Wrapped inside ${environement} App`
  )
)
export default HelloFromVan
```
### *Component Integration :*

#### JSX Based 
```jsx
import VanWrapper from "van-wrapper/react"
// import VanWrapper from "van-wrapper/solid"
// import VanWrapper from "van-wrapper/preact"
import HelloFromVan from "./HelloFromVan.js"
const environement = "React" // It's only a message 
export default function App(){
    return (
        <VanWrapper>
           <HelloFromVan 
              environement={environement} 
            />
        </VanWrapper>
    )
 }
```
#### Vue 
```xml
<script>
import VanWrapper from "van-wrapper/vue"
import HelloFromVan from "./HelloFromVan.js"
</script>
<template>
    <VanWrapper>
           <HelloFromVan 
              environement="Vue"  
            />
    </VanWrapper>
</template>
```
#### Svelte

```jsx
---
import VanWrapper from "van-wrapper/svelte";
import HelloFromVan from "./HelloFromVan.js"
---
<VanWrapper ui={HelloFromVan({environement:"Svelte"})}/>
```

## Why use this 

- Expanding VanJS Adoption : Developers can gradually adopt VanJS in existing codebases without disrupting the architecture.

- Use VanJS with features from other frameworks, like SolidJS’s file-based routing, to build dynamic apps ...

- Cross-Framework Compatibility: Supports React, Vue, Svelte, Solid, Preact and potentially other frameworks in the future.