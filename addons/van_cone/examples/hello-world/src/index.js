import createCone from 'van-cone'
import van from 'vanjs-core'
const { div, p, span, hr } = van.tags

// define page components
const homePage = () => div('Home Page')
const userPage = (params) => div('User Page', p('userId: ' + params.userId))

// define routes
const routes = [
  { path: '/', name: 'home', callable: async () => homePage },
  { path: '/user/:userId', name: 'user', callable: async () => userPage }
]

// create the spa object
const routerElement = div({ id: 'layout' })
const { link } = createCone(routerElement, routes)

// main app layout
const App = () =>
  div(
    link({name: 'home'}, 'Home'),
    span(' | '),
    link({name: 'user', params: {userId: 123}}, 'User'),
    hr(),
    routerElement
  )

document.body.replaceChildren(App());