/* van_dml: add auto-append to the van.tags
    elements are added automatically to the selected object between begin and end
    begin(document.body)
        h1("test it")
    end
    SP is the stackPointer, should be 0 at end of JS
    base is the current base object for append, null if none
*/
(() => {
    let _base = null;                // current inser point
    const _baseStack = [];    // Stack for storing _base positions
    const orgtags = van.tags
    // select new base for append, previous will be saved
    function begin(ID) {
        _baseStack.push(_base);// Save old base
        if (_baseStack.length > 100) throw new Error("_baseStackOverflow in begin()");
        _base = (typeof (ID) === 'string') ? document.getElementById(ID) : ID
        return _base
    }
    // restore last base, cnt: call multiple times
    function end(cnt = 1) {
        if (cnt > 1) end(cnt - 1)
        if (_baseStack.length <= 0) throw new Error("_baseStack empty in end()")
        return (_base = _baseStack.pop())    // restore old stack
    }

    // Proxy the proxy
    const tags = new Proxy((f, ...args) => {
        let r = f(...args)
        if (_base) van.add(_base, r)
        return r
    }, {
        get: (target, name) => {
            let o = {}; o[name] = 0; o = orgtags
            return target.bind(null, o[name])// o[name]
        }
    });

    /* ----------------------------------------------------------------------------
    css: create CSS-Defintions dynamically
    's' can be 
     - a string css(".myClass { color: red; }") 
     - a template with multiple rules
        css(`
          .myClass { color: red; }
          .myClass: hover { color: green }
        `)
   ----------------------------------------------------------------------------*/
    function css(s) {
        let rule = "", rules = [], sheet = window.document.styleSheets[0]  // Get styleSheet
        s.split("}").forEach(s => {
            let r = (s + "}").replace(/\r?\n|\r/g, "");  // create full rule again
            rule = (rule === "") ? r : rule + r
            if (rule.split('{').length === rule.split('}').length) { // equal number of brackets?
                sheet.insertRule(rule, sheet.cssRules.length)
                rule = ""
            }
        })
    }

    van.css = css
    van.base = () => _base
    van.sp = () => _baseStack.length
    van.begin = begin
    van.end = end
    van.tags = tags
})();
