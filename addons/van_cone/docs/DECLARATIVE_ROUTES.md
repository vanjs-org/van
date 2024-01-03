# what a potential api could look like for declarative routes

## basic
```javascript

router(
    route("user", "/user/:userId", userPage, {title: "VanJS Example | User", back: "/secure/user/:userId"}),
    route("item", "/items/:itemID", itemPage, {title: "VanJS Example | Item"}),
    route("home", "/", homePage, {title: "VanJS Example"}),
    route("notFound", ".*", notFoundPage, {title: "VanJS Example | Not Found"})
)


```

## nested routes
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

component example for nested route
```javascript
const userPage = (params, query, context, outlet) => {

  /* our parent component, a search page may have passed in preloaded information via navLink, if not, we'll fetch it */
  const userInfo = (context) ? context : fetchUserInfo(params.id)

  return div(
    p("Hi I am: " + userInfo.name),
    p("some query string data: " + query.data),
    outlet()  // would wrap one of userInbox, userFeed or userGallery with the params, query, context args passed in
  );
}

```