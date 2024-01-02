import context from "../context"
import van from "vanjs-core";
import "../index.css";

const { link } = context

console.log("navbar.js")

const { div, nav, hr } = van.tags

const navbar = () => {

  console.log("function Navbar");

  return () =>
    div(
      nav(
        { class: "nav" },
        link({name: "home", class: 'navbar-link'}, "Home"),
        link({name: "users", class: 'navbar-link'}, "Users"),
        link({name: "context", class: 'navbar-link'}, "Context"),
        link({name: "agreement", class: 'navbar-link'}, "Agreement")
      ),
      hr()
    )
};

export default navbar;
