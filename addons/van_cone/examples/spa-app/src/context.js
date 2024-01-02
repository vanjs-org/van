import "./index.css"
import createCone from "van-cone"
import van from "vanjs-core"

const routes = [
  {
    path: "/",
    name: "home",
    title: "VanJS Example | Home",
    callable: async () => import('./app/pages/home')
  },
  {
    path: "/context",
    name: "context",
    title: "VanJS Example | Context",
    callable: async () => (await import('./app/pages/agreement')).contextPage
  },
  {
    path: "/agreement",
    name: "agreement",
    title: "VanJS Example | Agreement",
    callable: async () => import('./app/pages/agreement')
  },
  {
    path: "/user/:userId",
    name: "user",
    title: "VanJS Example | User",
    callable: async () => import('./app/pages/user')
  },
  {
    path: "/users",
    name: "users",
    title: "VanJS Example | Users",
    callable: async () => import('./app/pages/users')
  },
  {
    path: ".*",
    name: "notFound",
    title: "VanJS Example | Not Found",
    callable: async () => import('./app/pages/notFound')
  },
]

const defaultContext = {agreement: false}
const layoutElement = van.tags.div({ id: "layout", class: "layout" })

const context = createCone(layoutElement, routes, defaultContext)
export default context
