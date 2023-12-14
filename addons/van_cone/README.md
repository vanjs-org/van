# Van Cone
### An SPA framework add on for VanJS

🔥 **Van Cone plus VanJS can create a fully featured SPA app that minifies and gzips to less than 3.5 kB!** 🔥

This lightweight (less than 250 lines) VanJS addon adds the following features:
- Navigation powered by custom router with async loading
    - integrates with browser history
    - state object integrates with browser history
    - url and query param parsing
- `navLink` component for generating links based off of named routes
    - easily add url and query params
    - active class css styling

# Overview

🚨 **Van Cone is in Beta - API changes are possible** 🚨

Van Cone is a minimal framework that provides routing, history and a link component that provides dynamic styling for when it is the active link.

There is only one exported function which is used to create an application object. You provide it with the DOM element that will contain the app, a list of routes, and an optional default state for `window.history.state` and it returns an object with several SPA helper methods.

Install:
```bash
npm install van-cone
```
A basic hello world app requires javascript and HTML:

Example JS:
```javascript
import createCone from 'van-cone';
import van from 'vanjs-core';
const { div, p, span, hr } = van.tags;

// define page components
const homePage = () => div('Home Page')
const userPage = (params) => div('User Page', p('userId: ' + params.userId))

// define routes
const routes = [
  { path: '/',              name: 'home', callable: async () => homePage },
  { path: '/user/:userId',  name: 'user', callable: async () => userPage }
];

// create the spa object
const routerElement = div({ id: 'layout' })
const { navLink } = createCone(routerElement, routes)

// main app layout
const App = () =>
  div(
    navLink({ name: 'home' }, 'Home'),
    span(' | '),
    navLink({name: 'user', params: {userId: 123}}, 'User'),
    hr(),
    routerElement
  );

document.body.replaceChildren(App());
```

Example HTML:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="Dialog Modal component with VanJS" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VanJS Hello World</title>
  </head>
  <body>
    <script src="./src/index.js" type="module"></script>
  </body>
</html>

```

# Examples

See the [examples](./examples/) folder for full working examples of a [hello world](./examples/hello-world/) ([preview](https://codesandbox.io/p/devbox/van-cone-hello-world-yxpxhy)), and more complex [application](./examples/spa-app/) ([preview](https://codesandbox.io/p/devbox/github/vanjs-org/van/tree/main/addons/van_cone/examples/spa-app)) with several pages.

# Documentation

See the [API Reference](./API_REFERENCE.md) for full documentation.

# Changelog
**0.0.3**
- rename `router.formatUrl` to `router.navUrl`
- add `router.backendUrl`, update `routes` to support backend urls
- add `pushHistory`
- add `context` to programmatic navigation functions that is passed to route element


# Support, issues, and suggestions
Open an issue or discussion either on the [offical repo](https://github.com/vanjs-org/van) or [my fork](https://github.com/b-rad-c/van/tree/main). Make sure to tag my username: [@b-rad-c](https://github.com/b-rad-c).

# Contributing
Got some skills? Want to contribute? Send a pull request!

I, [@b-rad-c](https://github.com/b-rad-c) am the maintainer of this project however the code is contained in the official [VanJS repo](https://github.com/vanjs-org/van). To contribute to this project please fork [my fork](https://github.com/b-rad-c/van/tree/main) and submit a pull request there. I will approve and then submit a pull request to the official repository. I couldn't refrain from writing 'fork my fork', sorry, not sorry.

### Roadmap
Some things I'm interested in.
* unittests
* convert to TypeScript
* stabilze API to come out of beta - comments or suggestions to the API are welcome.

# The Name
Van Cone is an addon for VanJS which is short for **Van**illa **J**ava**S**cript, and makes a callout to vanilla ice cream in its logo. Van Cone provides the cone that is needed to support the ice cream. VanJS provides reactivity and UI components, Van Cone provides routing, history and navigation components, together they're everything you need for a lightweight SPA experience!

# Credit
router based on [minimal router](https://github.com/jmhdez/minimal-router) (no longer maintained)