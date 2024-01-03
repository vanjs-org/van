# Van Cone | API Reference

See [README.md](../README.md) for installation and overview.

## Examples

See the [examples](../examples/) folder for full working examples of a [hello world](../examples/hello-world/) ([preview](https://codesandbox.io/p/devbox/van-cone-hello-world-yxpxhy)), and more complex [application](../examples/spa-app/) ([preview](https://codesandbox.io/p/devbox/github/vanjs-org/van/tree/main/addons/van_cone/examples/spa-app)) with several pages.

## Components
See the [component guide](./COMPONENT_GUIDE.md) for an explanation on components in Van Cone.

## Navigation
### component navigation 
- [`link`](#linkprops-children)

### programmatic navigation functions
- [`navigate`](#navigateroutename-options)
- [`pushHistory`](#pushhistoryroutename-options)

# API Reference

🚨 **Van Cone is in Beta - API changes are possible** 🚨

 ### `createCone(routerElement, routes, defaultNavState)`
 The only exported function from the module, used to create an application.

**arguments**

- `routerElement` - (required) the root DOM element element that holds the app (element defined by active route)

- `routes` - (required) an array of [`routes`](#routes)

- `defaultNavState` - (optional) the default navigation state, any type allowed by [`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)

- [`routerConfig`](#routerconfig) = (optional) - configure `prefix` to prepend to each url, or `backendPrefix` if different than frontend.

**return**

An object with the following items is returned:

- [`link`](#linkprops-children) - a VanJS link component that navigates to named routes and includes active link css styling

- [`navigate`](#navigateroutename-options) - a function for programmatic navigation

- [`isCurrentPage`](#iscurrentpagepagename) - a function to determine if a page is currently active

- [`navUrl`](#navurlroutename-params---query) - a function to generate a url string given a route name and url and query params.

- [`backendUrl`](#backendurlroutename-params---query) - a function to generate a url string given a route name and url and query params.

- `routerElement` - the same element passed to this function

- `currentPage` - a `van.state` object representing the `name` value of the active route

- `navState` - a `van.state` object representing the current [`window.history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state)

- `getNavState` - a function that returns `navState.val`

- `setNavState` - change [`window.history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state), any type allowed by [`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)


## `routes`

A list of objects defining each route. Each route object has the following properties:

**`path`** (required) a string defining the route's path. To create a URL param prefix it with a colon, use .* for wild cards (404 not found)

**`name`** (required) a string representing the name of the route, used for programmatic navigation

**`callable`** (required) a callback that either returns an element to put on the DOM or another callable that returns this element (for more complex apps requiring imports). The callback is passed 2 arguments, an object representing the params parsed from the URL and another representing parsed query string params.

**`backend`** (optional) provide this value when data is fetched from a different endpoint on the backend than on the frontend. See [`backendUrl`](#backendurlroutename-params---query) for more.

**`title`** (optional) if provided the title of the page will change to this when this route is active.

### example
Below is a basic example showing routes with url and query params and how to consume them in a component.

See the [component guide](./COMPONENT_GUIDE.md) for more examples.

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

## `routerConfig`
An object used to configure the router, it has two optional keys `prefix` and `backendPrefix`. If `routerConfig` is not provided or either key is not provided they will default to an empty string. 

`prefix` will be prepended to front end URLs, the ones shown in the browser and matched when navigating to different pages. See [`navUrl`](#navurlroutename-params---query) for more.

The `backendPrefix` is useful for when the backend is at a different host or has a different prefix than the front end. It is only used as a utility to generate URLs for fetching data, it is ignored for route matching and page navigation. See [`backendUrl`](#backendurlroutename-params---query) for more.

## `navUrl(routeName, params = {}, query = {})`
Return a string representing a url for the route with name `routeName`, and optionally form url params with the `params` argument or query params with the `query` argument. If `prefix` was included with [`routerConfig`](#routerconfig) it will be prepended to the url. This function is used internally by programmatic navigation in [`link`](#linkprops-children), [`navigate`](#navigateroutename-options) and [`pushHistory`](#pushhistoryroutename-options) and is generally not needed, but it exposed publically in case there is a need for the string. Note that the string is also returned by the programmatic functions.

**Note: to access this function from the return value of [`createCone`](#createconerouterelement-routes-defaultnavstate) call `navUrl`**

The following [`route`](#routes):
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
navUrl('user', { userId: 123 }, { activeTab: 'profile'})
// "/user/123?activeTab=profile"
```

## `backendUrl(routeName, params = {}, query = {})`
Return a string backend url for the route with name `routeName`, and optionally form url params with the `params` argument or query params with the `query` argument. The return can be used for fetching data. If `backendPrefix` was included with [`routerConfig`](#routerconfig) it will be prepended to the url.

The following [`routerConfig`](#routerconfig) and [`routes`](#routes):
```javascript
const routerConfig = { backendPrefix: 'http://localhost:8000' }

const routes = [
  {
      path: "/user/:userId",
      backend: "/api/user/:userId"
      name: "user",
      title: "VanJS Example | User",
      callable: async () => import('./app/pages/user')
  }
]
```

Will result in the following:

```javascript
backendUrl('user', { userId: 123 })
// "http://localhost:8000/api/user/123"

navUrl('user', { itemId: 123 })
// "http://localhost:8000/user/123"

```


## `navigate(routeName, options)`
Programmatically navigate to `routeName` using url generated by [`navUrl`](#navurlroutename-params---query), returns url as a string.

`routeName` - (required) a string representing the name of the route

`options` - (optional) an object with the following optional options
* `params` - supply url parameters to be used with `routeName` to generate the url
* `query` - supply query string parameters to be used with `routeName` to generate the url
* `navState` - if provided is provided it will be set as the browser history state using `setNavState` returned by the [`createCone`](#createconerouterelement-routes-defaultnavstate) function.
* `context` - if provided it will be pased to the resolved component for `routeName`. See [`example`](./COMPONENT_GUIDE.md#full-component-example) for details.
* `dispatch` - if true (the default) DOM will be updated with component configured for the route. Pass false if only browser history needs to be updated. Note that if you only want to update history you should use the [`pushHistory`](#pushhistoryroutename-options) function instead.

## `pushHistory(routeName, options)`
A wrapper around [`navigate`](#navigateroutename-options) that will only push a new browser state to the history stack and will not change the DOM.

## `isCurrentPage(pageName)`
Returns a `van.derive` object with a boolean that is true when `pageName` is the active route
```javascript
if (isCurrentPage("home").val) console.log("we're home!")
```

## `link(props, ...children)`
A light wrapper around `van.tags.a` that adds dynamic url generation for `routeName`, with url and query params to be used when generating the url with [`navUrl`](#navurlroutename-params---query). It also adds dynamic styling when `routeName` is the active route. Additional context can be provided to the component resolved by the router. For example, `link` could be used on a search results page to navigate to each item's page and could pass the item's data enabling item page to use preloaded data instead of fetching it.


### arguments

The argument signature is the same as `van.tags.a` but additional properties are available to the `props` argument which configure how the link component works.

```javascript
link(props, ...children)
```

`props` - an object that will be passed to the resulting `van.tags.a` function, unchanged with the following exceptions:

These are Van Cone props which are used for navigation and **will not** be passed to `van.tags.a`:
* `props.name` (required) - the name of the route to navigate to
* `props.params` (optional) - an object of url parameters defined by the route
* `props.query` (optional) - an object of query string parameters
* `props.context` (optional) - additional data to be passed to the component, see [component example](./COMPONENT_GUIDE.md#full-component-example) for more info.
* `props.navState` (optional) - optional data to set on `window.history.state`, see [`createCone`](#createconerouterelement-routes-defaultnavstate) for more.

The following are standard `a` tag props but have the following default values:
* `props.target` (default: `_self`)
* `props.class` (default: `router-link`)

The following are standard `a` tag props but are set by the `link` component and will be overwritten if provided:
* `props.href` is set by a call to [`navUrl`](#navurlroutename-params---query) with `props.name`, `props.params` and `props.query`
* `props.role` is set to `link`
* `props.onClick` is set to an internal navigation function

`children` - is passed unchanged to the resulting `van.tags.a` function.

### examples
A basic call to the route named `home` with the inner text for the a tag `Home`. This is the bare minimum required for `link`.

```javascript
link({name: 'home'}, 'Home')
```

A call to the route named `user` with the url param `userId` set to `123`, the inner text for the a tag is `User`.

```javascript
link({name: 'user', params: {userId: 123}}, 'User')
```

A call to the route named `users` with the query param `sort` set to `asc`, the inner text for the link is `ascending`.

```javascript
link({name: 'users', query: {sort: 'asc'}}, 'ascending')
```

Pass additional context which can be any data type to the component resolved by the route. See [example](./COMPONENT_GUIDE.md#full-component-example) for how to access context from within the component.

```javascript
link({name: 'users', context: {value: 'hello world'}}, 'User')
```

### styling

By default the class name for the a tag will be `router-link` but you can override it with the `class` property:

```javascript
link({name: 'home', class: 'navbar-link'}, "Home")
```

When the route for a `link` is active, the a tag's `aria-current` property will be set to `page`, which means you can set a custom style in your CSS like this:

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

### a tag only
Currently `link` only supports returning an `a` tag, but by using [`navigate`](#navigateroutename-options) you could make any element a router link, and then use [`isCurrentPage`](#iscurrentpagepagename) to dynamically change properties such as class or styling when the route is active.
