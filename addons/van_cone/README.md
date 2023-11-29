# Van Cone
### An SPA framework add on for VanJS

This lightweight (~200 lines) VanJS addon adds the following features:
- Navigation powered by custom router with async loading
    - integrates with browser history
    - state object integrates with browser history
    - url and query param parsing
- navLink component for generating links based off of named routes
    - easily add url and query params
    - active class css styling

# Overview

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

See the [examples](./examples/) folder for full working examples of a [hello world](./examples/hello-world/README.md), and more complex [application](./examples/spa-app/README.md) with several pages.

# API Reference

 ### `createCone(routerElement, routes, defaultNavState)`
 The only exported function from the module, used to create an application.

**arguments**

- routerElement - (required) the root DOM element element that holds the app (element defined by active route)

- routes - (required) an array of [routes](#routes)

- defaultNavState - (optional) the default navigation state, any type allowed by [history.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)

**return**

An object with the following items is returned:

- routerElement - the same element passed to this function

- currentPage - a `van.state` object representing the `name` value of the active route

- router - the [router](#router) object for the application

- navState - a `van.state` object representing the current [window.history.state](https://developer.mozilla.org/en-US/docs/Web/API/History/state)

- getNavState - a function that returns `navState.val`

- setNavState - change [window.history.state](https://developer.mozilla.org/en-US/docs/Web/API/History/state), any type allowed by [history.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)

- [navigate](#navigateurl) - a function for programmatic navigation

- [handleNav](#handlenavevent) - a wrapper around the [navigate](#navigateurl) function for handling events

- [isCurrentPage](#iscurrentpagepagename) - a function to determine if a page is currently active

- [navLink](#navlinkprops-children) - a VanJS link component that navigates to named routes and includes active link css styling


## `routes`

A list of objects defining each route. Each route object has the following properties:

**`path`** (required) a string defining the route's path. To create a URL param prefix it with a colon, use .* for wild cards (404 not found)

**`name`** (required) a string representing the name of the route, used for programmatic navigation

**`callable`** (required) a callback that either returns an element to put on the DOM or another callable that returns this element (for more complex apps requiring imports). The callback is passed 2 arguments, an object representing the params parsed from the URL and another representing parsed query string params.

**`title`** (optional) if provided the title of the page will change to this when this route is active.

### basic example
```javascript
const homePage = () => div('Home Page')

const routes = [{
    path: "/",
    name: "home",
    title: "VanJS Example | Home",
    callable: async () => homePage
}]
```

### url + query params example
```javascript
const userPage = (params) => div('User Page', p('userId: ' + params.userId))
const userListPage = (params, query) => div('User List', p('sort by: ' + query.sort))

const routes = [
    {
        path: "/user/:userId",
        name: "user",
        title: "VanJS Example | User",
        callable: async () => import('./app/pages/user')
    },
    {
        path: "/users",
        name: "users",
        title: "VanJS Example | User List",
        callable: async () => import('./app/pages/userList')
    }
]
```

### wildcard (not found page)
```javascript
const routes = [{
    path: ".*",
    name: "notFound",
    title: "VanJS Example | Not Found",
    callable: async () => import('./app/pages/notFound')
  }
];
```

### returning the route's element directly
Simple return via callable
```javascript
const homePage = () => div('Home Page')

const routes = [{
    path: "/",
    name: "home",
    title: "VanJS Example | Home",
    callable: async () => homePage
}]
```

### returning the route's element via import
For more complex apps with many pages, the async import method may be more appropriate.

#### Define route
```javascript
const routes = [{
    path: ".*",
    name: "home",
    title: "VanJS Example | Home",
    callable: async () => import('./app/pages/homePage')
  }
];
```

#### ./app/pages/homePage.js
```javascript
import van from "vanjs-core";

const { section, div, br, h1, img } = van.tags

const homePage = () => {

  return () =>
    section(
      h1("Welcome to this SPA demo using VanJS!"),
      br(),
      div(
        { style: "text-align:center;" },
        img({ src: vanLogo, alt: "VanJS", style: "height:100px;width:100px;" })
      )
    );
};

export default homePage;

```

## `router`

The router object has several attributes and methods, however right now the only documented public method is:

#### `formatUrl(routeName, params = {}, query = {})`
Return a string representing a url for the route with name `routeName`, and optionally form url params with the `params` argument or query params with the `query` argument. The return can be used with [navigate](#navigateurl) or any other place a url string is needed.

```javascript
/* example route
{
    path: "/user/:userId",
    name: "user",
    title: "VanJS Example | User",
    callable: async () => import('./app/pages/user')
}*/

router.formatUrl('user', { userId: 123 }, { activeTab: 'profile'})
// "/user/123?activeTab=profile"
```


## `navigate(url)`
Programatically navigate to `url`.

You can use [router.formatUrl](#formaturlroutename-params---query) to generate urls from named routes with url and query params.

## `handleNav(event)`
An event wrapper for [navigate](#navigateurl) to be used with an on click action. `handleNav` will call `event.preventDefault` and then call [navigate](#navigateurl) with `event.target.href`.

It is used internally to create the [navLink](#navlinkprops-children) component.

You can use [router.formatUrl](#formaturlroutename-params---query) to generate urls from named routes and formatting url/query params.

## `isCurrentPage(pageName)`
Returns a `van.derive` object with a boolean that is true when `pageName` is the active route
```javascript
if(isCurrentPage("home").val) console.log("we're home!")
```

## `navLink(props, ...children)`
Returns a link element using `van.tags.a` by passing `props` and `children` to the underling call to `van.tags.a` with a few modifications to the resulting `a` element that adds programmatic navigation and dynamic styling for when it is the active route. URLs are generated using the name of the route, and optional url and query string params.

### examples 
A basic call to the route named `home` with the inner text for the a tag `Home`. This is the bare minimum required for `navLink`.

```javascript
navLink({ name: 'home' }, 'Home')
```

A call to the route named `user` with the url param `userId` set to `123`, the inner text for the a tag is `User`.

```javascript
navLink({name: 'user', params: {userId: 123}}, 'User')
```

A call to the route named `users` with the query param `sort` set to `asc`, the inner text for the link is `ascending`.

```javascript
navLink({name: 'users', query: {sort: 'asc'}}, 'ascending')
```

### styling

By default the class name for the a tag will be `router-link` but you can override it with the `class` property:

```javascript
navLink({name: "home", class: 'navbar-link'}, "Home")
```

When the route for a `navLink` is active, the a tag's `aria-current` property will be set to `page`, which means you can set a custom style in your CSS like this:

```css
/* normal route */
.navbar-link {
  color: grey;
}

/* active route */
.navbar-link[aria-current="page"] {
  color: black;
}
```

### arguments

```javascript
navLink(props, ...children)
```

`navLink` allows almost full control of the creation of the link. It's arguments 
(`props` and `children`) are passed to the underlying `van.tags.a` unchaged with the following exceptions to the `props` argument:

These props are used for creating the url and **will not** be passed to `van.tags.a`:
* `props.name` (required)
* `props.params` (optional)
* `props.query` (optional)

The following have default values:
* `props.target` (default: `_self`)
* `props.class` (default: `router-link`)

The following are hardcoded and cannot be changed:
* `props.href` is set by a call to [router.formatUrl](#formaturlroutename-params---query) with `props.name`, `props.params` and `props.query`
* `props.role` is set to `link`
* `props.onClick` is set to [handleNav](#handlenavevent)



### a tag only
Currently `navLink` only supports returning an `a` tag, but by using [navigate](#navigateurl) or [handleNav](#handlenavevent) you could make any element a router link, and then use [isCurrentPage](#iscurrentpagepagename) to dynamically change properties such as class or styling when the route is active.

# The Name
Van Cone is an addon for VanJS which is short for **Van**illa **J**ava**S**cript, and makes a callout to vanilla ice cream in its logo. Van Cone provides the cone that is needed to support the ice cream. VanJS provides reactivity and UI components, Van Cone provides routing, history and navigation components, together they're everything you need for a lightweight SPA experience!

# Credit
router based on [minimal router](https://github.com/jmhdez/minimal-router) (no longer maintained)