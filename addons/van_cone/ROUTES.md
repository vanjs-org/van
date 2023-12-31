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

```javascript

router(
    route("user", "/user/:userId", userPage, {title: "VanJS Example | User", back: "/secure/user/:userId"}),
    route("item", "/items/:itemID", itemPage, {title: "VanJS Example | Item"}),
    route("home", "/", homePage, {title: "VanJS Example"}),
    route("notFound", ".*", homePage, {title: "VanJS Example | Not Found"})
)


```


```javascript

router(
    route("user", "/user/:userId", userPage, {title: "VanJS Example | User", back: "/secure/user/:userId"},
        route("user-inbox", "/inbox", userInbox),
        route("user-feed", "/feed", userFeed),
        route("user-gallery", "/gallery", userGallery)
    ),
    route("item", "/items/:itemID", itemPage, {title: "VanJS Example | Item"}),
    route("home", "/", homePage, {title: "VanJS Example"}),
    route("notFound", ".*", homePage, {title: "VanJS Example | Not Found"})
)

```

```javascript
const userPage = (params, query, context, outlet) => {

  /* our parent component, a search page may have passed in preloaded information via navLink, if not, we'll fetch it */
  const userInfo = (context) ? context : fetchUserInfo(params.id)

  return div(
    p("Hi I am: " + userInfo.name),
    p("some query string data: " + query.data),
    outlet()
  );
}

```