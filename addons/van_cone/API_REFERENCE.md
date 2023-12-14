# Van Cone 

See [README.md](./README.md) for installation and overview.

# API Reference

🚨 **Van Cone is in Beta - API changes are possible** 🚨

 ### `createCone(routerElement, routes, defaultNavState)`
 The only exported function from the module, used to create an application.

**arguments**

- `routerElement` - (required) the root DOM element element that holds the app (element defined by active route)

- `routes` - (required) an array of [routes](#routes)

- `defaultNavState` - (optional) the default navigation state, any type allowed by [history.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)

- [routerConfig](#constructorrouterconfig) = (optional) - configure `prefix` to prepend to each url, or `backendPrefix` if different than frontend.

**return**

An object with the following items is returned:

- `routerElement` - the same element passed to this function

- `currentPage` - a `van.state` object representing the `name` value of the active route

- `router` - the [router](#router) object for the application

- `navState` - a `van.state` object representing the current [`window.history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state)

- `getNavState` - a function that returns `navState.val`

- `setNavState` - change [`window.history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state), any type allowed by [`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)

- [`navigate`](#navigateurl-context) - a function for programmatic navigation

- [`handleNav`](#handlenavevent-context) - a wrapper around the [`navigate`](#navigateurl-context) function for handling events

- [`isCurrentPage`](#iscurrentpagepagename) - a function to determine if a page is currently active

- [`navLink`](#navlinkprops-children) - a VanJS link component that navigates to named routes and includes active link css styling


## `routes`

A list of objects defining each route. Each route object has the following properties:

**`path`** (required) a string defining the route's path. To create a URL param prefix it with a colon, use .* for wild cards (404 not found)

**`name`** (required) a string representing the name of the route, used for programmatic navigation

**`callable`** (required) a callback that either returns an element to put on the DOM or another callable that returns this element (for more complex apps requiring imports). The callback is passed 2 arguments, an object representing the params parsed from the URL and another representing parsed query string params.

**`backend`** (optional) provide this value when data is fetched from a different endpoint on the backend than on the frontend. See [router.backendUrl](#backendurlroutename-params---query) for more.

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

### different backend endpoint
When data is fetched from a different endpoint provide a backend path as follows. See [router.backendUrl](#backendurlroutename-params---query) for information on generating a backend url for fetching data.
```javascript
const routes = [
    {
        path: "/user/:userId",
        backend: "/api/user/:userId",
        name: "user",
        title: "VanJS Example | User",
        callable: async () => import('./app/pages/user')
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

```javascript
// Define route
const routes = [{
    path: ".*",
    name: "home",
    title: "VanJS Example | Home",
    callable: async () => import('./app/pages/homePage')
  }
];
```

```javascript
// ./app/pages/homePage.js
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

### full component example
Here is a full example showing url parameters, query parameters and additional context.

Given the following route:
```javascript
{
    path: "/user/:id",
    name: "user",
    title: "VanJS Example | User",
    callable: async () => import('./app/pages/user')
}
```

And navLink:
```javascript
const data = {'name': 'María'}
navLink({name: 'user', params: {id: 123}, query: {'data': 'hello'}, context: data}, 'User')
```

A component can use the data as follows:
```javascript
const userPage = (params, query, context) => {

  /* our parent component, a search page may have passed in preloaded information via navLink, if not, we'll fetch it */
  const userInfo = (context) ? context : fetchUserInfo(params.id)

  return div(
    p("Hi I am: " + userInfo.name),
    p("some query string data: " + query.data)
  );
}

```

## `router`

#### `constructor(routerConfig)`
The `routerConfig` object is used to construct a new router, it is an object with two optional keys `prefix` and `backendPrefix`. If `routerConfig` is not provided or either key is not provided they will default to an empty string. 

`prefix` will be prepended to front end URLs, the ones shown in the browser and matched when navigating to different pages. See [router.navUrl](#navurlroutename-params---query) for more.

The `backendPrefix` is useful for when the backend is at a different host or has a different prefix than the front end. It is only used as a utility to generate URLs for fetching data, it is ignored for route matching and page navigation. See [router.backendUrl](#backendurlroutename-params---query) for more.

#### `navUrl(routeName, params = {}, query = {})`
Return a string representing a url for the route with name `routeName`, and optionally form url params with the `params` argument or query params with the `query` argument. The return can be used with [navigate](#navigateurl-context) or any other place a url string is needed. If `prefix` was included with [routerConfig](#constructorrouterconfig) it will be prepended to the url.

**Note: to access this function from the return value of [createCone](#createconerouterelement-routes-defaultnavstate) call `router.navUrl`**

The following [route](#routes):
```javascript
{
    path: "/user/:userId",
    name: "user",
    title: "VanJS Example | User",
    callable: async () => import('./app/pages/user')
}
```

will result in the following:
```javascript
router.formatUrl('user', { userId: 123 }, { activeTab: 'profile'})
// "/user/123?activeTab=profile"
```

#### `backendUrl(routeName, params = {}, query = {})`
Return a string backend url for the route with name `routeName`, and optionally form url params with the `params` argument or query params with the `query` argument. The return can be used for fetching data. If `backendPrefix` was included with [routerConfig](#constructorrouterconfig) it will be prepended to the url.

**Note: to access this function from the return value of [createCone](#createconerouterelement-routes-defaultnavstate) call `router.backendUrl`**

The following [routerConfig](#constructorrouterconfig) and [routes](#routes):
```javascript
const routerConfig = { backendPrefix: 'http://localhost:8000' }

const routes = [
  // with backend path
  {
      path: "/user/:userId",
      backend: "/secure/user/:userId"
      name: "user",
      title: "VanJS Example | User",
      callable: async () => import('./app/pages/user')
  },
  // without backend path
  {
      path: "/item/:itemId",
      name: "item",
      title: "VanJS Example | Item",
      callable: async () => import('./app/pages/user')
  }
]
```

Will result in the following:

```javascript
router.formatUrl('user', { userId: 123 })
// "http://localhost:8000/secure/user/123"

router.formatUrl('item', { itemId: 123 })
// "http://localhost:8000/item/123"

```


## `navigate(url, context)`
Programmatically navigate to `url`. Optionally pass `context` which can be and data to the resolved router component.

You can use [router.navUrl](#navigateurl-context) to generate urls from named routes with url and query params.

## `pushHistory(url)`
Push `url` to browser history and update address bar only, do not modify DOM.

You can use [router.navUrl](#navigateurl-context) to generate urls from named routes with url and query params.

## `handleNav(event, context)`
An event wrapper for [`navigate`](#navigateurl-context) to be used with an on click action. `handleNav` will call `event.preventDefault` and then call [`navigate`](#navigateurl-context) with `event.target.href`.

It is used internally to create the [navLink](#navlinkprops-children) component.

Optionally pass `context` which can be and data to the resolved router component.

You can use [router.navUrl](#navurlroutename-params---query) to generate urls from named routes and formatting url/query params.

## `isCurrentPage(pageName)`
Returns a `van.derive` object with a boolean that is true when `pageName` is the active route
```javascript
if (isCurrentPage("home").val) console.log("we're home!")
```

## `navLink(props, ...children)`
Uses [router.navUrl](#navurlroutename-params---query) to return a link element using `van.tags.a` by passing `props` and `children` to the underling call to `van.tags.a` with a few modifications to the resulting `a` element that adds programmatic navigation and dynamic styling for when it is the active route. URLs are generated using the name of the route, and optional url and query string params.

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

Pass additional context which can be any data type to the component resolved by the route.

```javascript
navLink({name: 'users', context: {value: 'hello world'}}, 'User')
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
(`props` and `children`) are passed to the underlying `van.tags.a` unchanged with the following exceptions to the `props` argument:

These props are used for creating the url and **will not** be passed to `van.tags.a`:
* `props.name` (required)
* `props.params` (optional)
* `props.query` (optional)
* `props.context` (optional)

The following have default values:
* `props.target` (default: `_self`)
* `props.class` (default: `router-link`)

The following are hardcoded and cannot be changed:
* `props.href` is set by a call to [router.navUrl](#navurlroutename-params---query) with `props.name`, `props.params` and `props.query`
* `props.role` is set to `link`
* `props.onClick` is set to [`handleNav`](#handlenavevent-context)



### a tag only
Currently `navLink` only supports returning an `a` tag, but by using [`navigate`](#navigateurl-context) or [`handleNav`](#handlenavevent-context) you could make any element a router link, and then use [`isCurrentPage`](#iscurrentpagepagename) to dynamically change properties such as class or styling when the route is active.
