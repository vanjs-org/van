# Van Cone | component and routing guide

In an effort to keep the VanJS ecosystem lightweight Van Cone does define a component object like many reactive frameworks however you will see that they are not necessary with Van Cone/VanJS. When the term component is used in Van Cone documentation it refers to a callable that takes a specific set of arguments from the Van Cone router and returns a tag element from Van JS, for example `van.tags.div`.

In this guide you will find:

* [component function definition](#function-signature)
* [a hello world example](#hello-world-with-router)
* [a url and query param example](#url--query-params-example)
* [a full component example with nav link component](#full-component-example)
* [an example using a backend endpoint which is different than the frontend](#different-backend-endpoint)
* [wildcard / 404 not found](#wildcard-not-found-page)
* [return component directly](#returning-the-routes-element-directly)
* [return a component via import](#returning-the-routes-element-via-import)

# Component functions

A component function takes up to 3 arguments and returns a van js tag element. The Van Cone router will call this component function when activating the route.

## function signature

```javascript
const myComponent = (params, query, context) => div(...)
```

`params` - an object of parameters parsed out of the url, see example below for defining the router. If no parameters were defined in the router this will be an empty object.

`query` - an object of query string parameters, if none exist in the url this will be an empty object.

`context` - additional context (for example prefetched data) can be passed to the component when navigating programmatically. If none is provided this will be an empty object. Typically this would be an object but it could be any data type. See [link](./API_REFERENCE.md#linkroutename-props-children), [navigate](./API_REFERENCE.md#navigateroutename-options), and [handleNav](./API_REFERENCE.md#handlenavevent-context) for information on programmatic navigation.

## examples

### the hello world

```javascript
const homePage = () => div('Home Page')
```

You obviously don't need a framework to do this, outside of the Van Cone router, components are generally not needed because they are simply a function that returns a van element. They are many ways to create re-usable components, component functions in Van Cone are only needed to create a concept of a page that integrates with the router.


### hello world with router
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
URL params are defined in the `path` property of the route object using a colon, query params are automatically parsed and passed to the component without needing to setup anything in the route. Currently query args are returned as raw strings and the component may need to do its own type validation/conversion.

```javascript
// use url params to parse a user id
const userPage = (params) => div('User Page', p('userId: ' + params.userId))

// use query params to define a sort on a list page
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

A component can use the data as follows:
```javascript
const userPage = (params, query, context) => {

  /* our parent component, a search page may have passed in preloaded information via link, if not, we'll fetch it */
  const userInfo = (context) ? context : fetchUserInfo(params.id)

  return div(
    p("Hi I am: " + userInfo.name),
    p("some query string data: " + query.data)
  );
}

```

You can use the [`link`](./API_REFERENCE.md#linkroutename-props-children) component to navigate to this page like this:

```javascript
const data = {'name': 'María'}
link({name: 'user', params: {id: 123}, query: {'data': 'hello'}, context: data}, 'User')
```

### different backend endpoint
When data is fetched from a different endpoint provide a backend path as follows. See [backendUrl](./API_REFERENCE.md#backendurlroutename-params---query) for information on generating a backend url for fetching data.
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
