import navbar from "./app/navbar";
import van from "vanjs-core";
import context from "./context"
const { div } = van.tags;

const { routerElement, router } = context

const Navbar = navbar();

const App = () =>
  div(
    Navbar(),
    routerElement
  );

console.log(router.formatUrl('user', { userId: 123 }, { activeTab: 'profile'}))

document.body.replaceChildren(App());
