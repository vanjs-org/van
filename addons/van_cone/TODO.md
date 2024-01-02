# VanJS Todo

* 🟢 change `navigate` and `pushHistory` to use route names, and accept optional nav state, they should return the url string
* 🟢 rename `navLink` to `link`
* 🟢 update `createVanCone` to return `router.navUrl` and `router.backendUrl` as `navUrl` and `backendUrl` and remove `router` from return
* 🟢 update
    * 🟢 hello world example
    * 🟢 spa-example
* 🟢 update documentation
    * 🟢 update api docs
    * 🟢 update move sections of readme with links to different file and create two links in readme, one with absolute github link for NPM and another with relative link
    * 🟢 rename doc references and links to 
        * 🟢 `navLink`
        * 🟢 `router.navUrl`
        * 🟢 `router.backendUrl`
    * 🟢 check for broken links in md files
    * 🟢 remove handleNav from return and documentation
    * 🟢 add navState to link props documentation
* 🟢 remove extra callable wrapper for .default imports on component functions
    * 🟢 check .default and call it
    * 🟢 update examples
    * 🟢 update documentation - include example for default and non default imports
    * 🟢 check for broken links in md files
    * 🟢 check bundled size and update readme
