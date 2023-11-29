import context from "../context"
import van from "vanjs-core";
import "../index.css";

const { navLink } = context

console.log("navbar.js")

const { div, nav, hr } = van.tags

const navbar = () => {

  console.log("function Navbar");

  return () =>
    div(
      nav(
        { class: "nav" },
        navLink({name: "home", class: 'navbar-link'}, "Home"),
        navLink({name: "users", class: 'navbar-link'}, "Users"),
        navLink({name: "context", class: 'navbar-link'}, "Context"),
        navLink({name: "agreement", class: 'navbar-link'}, "Agreement")
      ),
      hr()
    )
};

export default navbar;
