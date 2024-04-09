window.numTests = 0;
window.runTests = async (van, vanX, file) => {
    const { a, button, code, del, div, h2, input, li, ol, p, pre, span, sup, ul } = van.tags;
    const assert = (cond) => {
        if (!cond)
            throw new Error("Assertion failed");
    };
    const assertEq = (lhs, rhs) => {
        if (lhs !== rhs)
            throw new Error(`Assertion failed. Expected equal. Actual lhs: ${lhs}, rhs: ${rhs}.`);
    };
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const shuffle = (input) => {
        const output = [...input];
        for (let i = output.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [output[i], output[j]] = [output[j], output[i]];
        }
        return output;
    };
    const waitMsForDerivations = 5;
    const withHiddenDom = (func) => async () => {
        const dom = div({ class: "hidden" });
        van.add(document.body, dom);
        try {
            await func(dom);
        }
        finally {
            dom.remove();
        }
    };
    const tests = {
        reactive_basic: withHiddenDom(async (hiddenDom) => {
            const base = vanX.reactive({
                a: 1,
                b: 2,
                name: {
                    first: "Tao",
                    last: "Xin",
                },
                list: [1, 2, 3],
            });
            const derived = vanX.reactive({
                // Derived individual fields
                a: {
                    double: vanX.calc(() => base.a * 2),
                    squared: vanX.calc(() => base.a * base.a),
                },
                // Derived object
                b: vanX.calc(() => ({
                    double: base.b * 2,
                    squared: base.b * base.b,
                })),
                fullName: vanX.calc(() => `${base.name.first} ${base.name.last}`),
                list: vanX.calc(() => ({
                    length: base.list.length,
                    sum: base.list.reduce((acc, val) => acc + val, 0),
                })),
            });
            assertEq(Object.keys(base).toString(), "a,b,name,list");
            assertEq(Object.keys(derived).toString(), "a,b,fullName,list");
            van.add(hiddenDom, div(div(code(() => `${base.a} * 2 = ${derived.a.double}`)), div(code(() => base.a, sup(2), " = ", () => derived.a.squared)), div(code(() => `${base.b} * 2 = ${derived.b.double}`)), div(code(() => base.b, sup(2), " = ", () => derived.b.squared)), div("Name: ", () => `${base.name.first} ${base.name.last}`), 
            // Directly using the state object
            div("Full name: ", vanX.stateFields(derived).fullName), div("The length of ", () => base.list.toString(), " is ", () => derived.list.length, "."), div("The sum of ", () => base.list.toString(), " is ", () => derived.list.sum, ".")));
            assertEq(hiddenDom.innerHTML, '<div><div><code>1 * 2 = 2</code></div><div><code>1<sup>2</sup> = 1</code></div><div><code>2 * 2 = 4</code></div><div><code>2<sup>2</sup> = 4</code></div><div>Name: Tao Xin</div><div>Full name: Tao Xin</div><div>The length of 1,2,3 is 3.</div><div>The sum of 1,2,3 is 6.</div></div>');
            base.a = 5;
            base.b = 10;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Tao Xin</div><div>Full name: Tao Xin</div><div>The length of 1,2,3 is 3.</div><div>The sum of 1,2,3 is 6.</div></div>');
            base.name = { first: "Vanilla", last: "JavaScript" };
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Vanilla JavaScript</div><div>Full name: Vanilla JavaScript</div><div>The length of 1,2,3 is 3.</div><div>The sum of 1,2,3 is 6.</div></div>');
            base.name.first = "Van";
            base.name.last = "JS";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Van JS</div><div>Full name: Van JS</div><div>The length of 1,2,3 is 3.</div><div>The sum of 1,2,3 is 6.</div></div>');
            base.list = [1, 2, 3, 4, 5];
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Van JS</div><div>Full name: Van JS</div><div>The length of 1,2,3,4,5 is 5.</div><div>The sum of 1,2,3,4,5 is 15.</div></div>');
            base.list[2] = 5;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 20</code></div><div><code>10<sup>2</sup> = 100</code></div><div>Name: Van JS</div><div>Full name: Van JS</div><div>The length of 1,2,5,4,5 is 5.</div><div>The sum of 1,2,5,4,5 is 17.</div></div>');
            // Validate we can alter the values deeply under `derived` object
            derived.b.double = 21;
            derived.b.squared = 101;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div><code>5 * 2 = 10</code></div><div><code>5<sup>2</sup> = 25</code></div><div><code>10 * 2 = 21</code></div><div><code>10<sup>2</sup> = 101</code></div><div>Name: Van JS</div><div>Full name: Van JS</div><div>The length of 1,2,5,4,5 is 5.</div><div>The sum of 1,2,5,4,5 is 17.</div></div>');
        }),
        reactive_insertNewField: withHiddenDom(async (hiddenDom) => {
            const base = vanX.reactive({});
            assertEq(Object.keys(base).toString(), "");
            base.name = { first: "Tao", last: "Xin" };
            assertEq(Object.keys(base).toString(), "name");
            assertEq(Object.keys(base.name).toString(), "first,last");
            const derived = vanX.reactive({});
            assertEq(Object.keys(derived).toString(), "");
            derived.fullName = vanX.calc(() => `${base.name.first} ${base.name.last}`);
            assertEq(Object.keys(derived).toString(), "fullName");
            van.add(hiddenDom, div("Name: ", () => `${base.name.first} ${base.name.last}`), 
            // Directly using the state object
            div("Full name: ", vanX.stateFields(derived).fullName));
            assertEq(hiddenDom.innerHTML, '<div>Name: Tao Xin</div><div>Full name: Tao Xin</div>');
            base.name.first = "Alexander";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Name: Alexander Xin</div><div>Full name: Alexander Xin</div>');
            base.name = { first: "Vanilla", last: "JavaScript" };
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Name: Vanilla JavaScript</div><div>Full name: Vanilla JavaScript</div>');
            base.name.first = "Van";
            base.name.last = "JS";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Name: Van JS</div><div>Full name: Van JS</div>');
        }),
        reactive_existingClassWithMethod: withHiddenDom(async (hiddenDom) => {
            class Person {
                firstName;
                lastName;
                constructor(firstName, lastName) {
                    this.firstName = firstName;
                    this.lastName = lastName;
                }
                fullName() { return `${this.firstName} ${this.lastName}`; }
            }
            const person = vanX.reactive(new Person("Tao", "Xin"));
            van.add(hiddenDom, div("Name: ", () => `${person.firstName} ${person.lastName}`), div("Full name: ", () => person.fullName()));
            assertEq(hiddenDom.innerHTML, '<div>Name: Tao Xin</div><div>Full name: Tao Xin</div>');
            person.firstName = "Vanilla";
            person.lastName = "JavaScript";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Name: Vanilla JavaScript</div><div>Full name: Vanilla JavaScript</div>');
            person.firstName = "Van";
            person.lastName = "JS";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Name: Van JS</div><div>Full name: Van JS</div>');
        }),
        reactive_existingClassWithCustomGet: withHiddenDom(async (hiddenDom) => {
            class Person {
                firstName;
                lastName;
                constructor(firstName, lastName) {
                    this.firstName = firstName;
                    this.lastName = lastName;
                }
                get fullName() { return `${this.firstName} ${this.lastName}`; }
            }
            const person = vanX.reactive(new Person("Tao", "Xin"));
            van.add(hiddenDom, div("Name: ", () => `${person.firstName} ${person.lastName}`), div("Full name: ", () => person.fullName));
            assertEq(hiddenDom.innerHTML, '<div>Name: Tao Xin</div><div>Full name: Tao Xin</div>');
            person.firstName = "Vanilla";
            person.lastName = "JavaScript";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Name: Vanilla JavaScript</div><div>Full name: Vanilla JavaScript</div>');
            person.firstName = "Van";
            person.lastName = "JS";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Name: Van JS</div><div>Full name: Van JS</div>');
        }),
        reactive_existingClassWithCustomSet: withHiddenDom(async (hiddenDom) => {
            class Data {
                x;
                constructor(x) {
                    this.x = x;
                }
                get y() { return this.x * 2; }
                set y(value) { this.x = value / 2; }
            }
            const data = vanX.reactive(new Data(5));
            van.add(hiddenDom, div("x: ", () => data.x), div("y: ", () => data.y));
            assertEq(hiddenDom.innerHTML, "<div>x: 5</div><div>y: 10</div>");
            data.x = 10;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, "<div>x: 10</div><div>y: 20</div>");
            data.y = 6;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, "<div>x: 3</div><div>y: 6</div>");
        }),
        reactive_deleteProperty: () => {
            const data = vanX.reactive({ a: 1, b: 2 });
            delete data.a;
            assertEq(JSON.stringify(data), '{"b":2}');
            assertEq(Object.keys(vanX.stateFields(data)).toString(), "b");
            delete data.b;
            assertEq(JSON.stringify(data), '{}');
            assertEq(Object.keys(vanX.stateFields(data)).toString(), "");
        },
        reactive_arrayJson: async () => {
            const data = vanX.reactive([1, 2]);
            let numDerivations = 0;
            const json = van.derive(() => {
                ++numDerivations;
                return JSON.stringify(data);
            });
            assertEq(json.val, '[1,2]');
            assertEq(numDerivations, 1);
            data[0] = 3;
            await sleep(waitMsForDerivations);
            assertEq(json.val, '[3,2]');
            assertEq(numDerivations, 2);
            data.push(4);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '[3,2,4]');
            assertEq(numDerivations, 3);
            delete data[1];
            await sleep(waitMsForDerivations);
            assertEq(json.val, '[3,null,4]');
            assertEq(numDerivations, 4);
            vanX.replace(data, _ => [1, 2, 3, 4]);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '[1,2,3,4]');
            assertEq(numDerivations, 5);
            vanX.replace(data, _ => [1, 2]);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '[1,2]');
            assertEq(numDerivations, 6);
            vanX.replace(data, _ => []);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '[]');
            assertEq(numDerivations, 7);
            vanX.replace(data, [1, 2, 3, 4]);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '[1,2,3,4]');
            assertEq(numDerivations, 8);
            vanX.replace(data, [1, 2]);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '[1,2]');
            assertEq(numDerivations, 9);
            vanX.replace(data, []);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '[]');
            assertEq(numDerivations, 10);
        },
        reactive_objJson: async () => {
            const data = vanX.reactive({ a: 1, b: 2 });
            let numDerivations = 0;
            const json = van.derive(() => {
                ++numDerivations;
                return JSON.stringify(data);
            });
            assertEq(json.val, '{"a":1,"b":2}');
            assertEq(numDerivations, 1);
            data.a = 3;
            await sleep(waitMsForDerivations);
            assertEq(json.val, '{"a":3,"b":2}');
            assertEq(numDerivations, 2);
            data.c = 4;
            await sleep(waitMsForDerivations);
            assertEq(json.val, '{"a":3,"b":2,"c":4}');
            assertEq(numDerivations, 3);
            delete data.b;
            await sleep(waitMsForDerivations);
            assertEq(json.val, '{"a":3,"c":4}');
            assertEq(numDerivations, 4);
            vanX.replace(data, _ => [["a", 1], ["b", 2], ["c", 3], ["d", 4]]);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '{"a":1,"b":2,"c":3,"d":4}');
            assertEq(numDerivations, 5);
            vanX.replace(data, _ => [["a", 1], ["b", 2]]);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '{"a":1,"b":2}');
            assertEq(numDerivations, 6);
            vanX.replace(data, _ => []);
            await sleep(waitMsForDerivations);
            assertEq(json.val, '{}');
            assertEq(numDerivations, 7);
        },
        reactive_nullOrUndefinedFields: withHiddenDom(async (hiddenDom) => {
            const data = vanX.reactive({
                a: null,
                b: undefined,
                c: 1,
                d: 2,
            });
            van.add(hiddenDom, div("a: ", () => String(data.a)), div("b: ", () => String(data.b)), div("c: ", () => String(data.c)), div("d: ", () => String(data.d)));
            assertEq(hiddenDom.innerHTML, '<div>a: null</div><div>b: undefined</div><div>c: 1</div><div>d: 2</div>');
            data.c = null;
            data.d = undefined;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>a: null</div><div>b: undefined</div><div>c: null</div><div>d: undefined</div>');
        }),
        reactive_deletedFields: withHiddenDom(async (hiddenDom) => {
            const data = vanX.reactive({ a: 1 });
            assertEq(data.a, 1);
            delete data.a;
            assertEq(data.a, undefined);
            // Add the deleted field back to validate the field can still be used to bind with DOM elements
            data.a = 2;
            van.add(hiddenDom, () => data.a);
            assertEq(hiddenDom.innerHTML, "2");
            data.a = 3;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, "3");
        }),
        reactive_arrayLength: async () => {
            const data = vanX.reactive([]);
            let numLengthDerived = 0;
            const length = van.derive(() => {
                ++numLengthDerived;
                return data.length;
            });
            assertEq(length.val, 0);
            assertEq(numLengthDerived, 1);
            data.push(1);
            await sleep(waitMsForDerivations);
            assertEq(length.val, 1);
            assertEq(numLengthDerived, 2);
            data.push(2);
            await sleep(waitMsForDerivations);
            assertEq(length.val, 2);
            assertEq(numLengthDerived, 3);
            data.push(3);
            await sleep(waitMsForDerivations);
            assertEq(length.val, 3);
            assertEq(numLengthDerived, 4);
            data.push(4);
            await sleep(waitMsForDerivations);
            assertEq(length.val, 4);
            assertEq(numLengthDerived, 5);
            data.push(5);
            await sleep(waitMsForDerivations);
            assertEq(length.val, 5);
            assertEq(numLengthDerived, 6);
            data[5] = 6;
            await sleep(waitMsForDerivations);
            assertEq(length.val, 6);
            assertEq(numLengthDerived, 7);
            data.pop();
            await sleep(waitMsForDerivations);
            assertEq(length.val, 5);
            assertEq(numLengthDerived, 8);
            data.pop();
            await sleep(waitMsForDerivations);
            assertEq(length.val, 4);
            assertEq(numLengthDerived, 9);
            data.pop();
            await sleep(waitMsForDerivations);
            assertEq(length.val, 3);
            assertEq(numLengthDerived, 10);
            data.pop();
            await sleep(waitMsForDerivations);
            assertEq(length.val, 2);
            assertEq(numLengthDerived, 11);
            data.pop();
            await sleep(waitMsForDerivations);
            assertEq(length.val, 1);
            assertEq(numLengthDerived, 12);
            data.pop();
            await sleep(waitMsForDerivations);
            assertEq(length.val, 0);
            assertEq(numLengthDerived, 13);
        },
        raw_basic: withHiddenDom(async (hiddenDom) => {
            const base = vanX.reactive({ a: 3, b: 5 });
            const derived = vanX.reactive({ s: vanX.calc(() => vanX.raw(base).a + base.b) });
            van.add(hiddenDom, div(() => derived.s), input({ type: "text", value: () => vanX.raw(base).a + base.b }), p(() => vanX.raw(base).a + base.b));
            assertEq(hiddenDom.querySelector("div").innerText, "8");
            assertEq(hiddenDom.querySelector("input").value, "8");
            assertEq(hiddenDom.querySelector("p").innerText, "8");
            // Changing `base.a` won't trigger any derivations, as `base.a` is accessed via
            // `vanX.raw(base).a`.
            ++base.a;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("div").innerText, "8");
            assertEq(hiddenDom.querySelector("input").value, "8");
            assertEq(hiddenDom.querySelector("p").innerText, "8");
            // Changing `base.b` will trigger all the derivations, as `base.b` is accessed via `base.b`.
            ++base.b;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("div").innerText, "10");
            assertEq(hiddenDom.querySelector("input").value, "10");
            assertEq(hiddenDom.querySelector("p").innerText, "10");
        }),
        raw_nestedObj: withHiddenDom(async (hiddenDom) => {
            const base = vanX.reactive({ a: { a: 1, b: 2 }, b: { a: 3, b: 4 } });
            const derived = vanX.reactive({ s: vanX.calc(() => vanX.raw(base).a.a + vanX.raw(base).a.b + base.b.a + base.b.b) });
            van.add(hiddenDom, div(() => derived.s), input({ type: "text", value: () => vanX.raw(base).a.a + base.b.a }), p(() => vanX.raw(base).a.b + base.b.b));
            assertEq(hiddenDom.querySelector("div").innerText, "10");
            assertEq(hiddenDom.querySelector("input").value, "4");
            assertEq(hiddenDom.querySelector("p").innerText, "6");
            // Changing `base.a.a` won't trigger any derivations, as `base.a.a` is accessed via
            // `vanX.raw(base).a.a`.
            ++base.a.a;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("div").innerText, "10");
            assertEq(hiddenDom.querySelector("input").value, "4");
            assertEq(hiddenDom.querySelector("p").innerText, "6");
            // Changing `base.b.a` will trigger all the relevant derivations, as `base.b.a` is accessed
            // via `base.b.a`.
            ++base.b.a;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("div").innerText, "12");
            assertEq(hiddenDom.querySelector("input").value, "6");
            assertEq(hiddenDom.querySelector("p").innerText, "6");
            // Changing `base.a.b` won't trigger any derivations, as `base.a.b` is accessed via
            // `vanX.raw(base).a.b`.
            ++base.a.b;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("div").innerText, "12");
            assertEq(hiddenDom.querySelector("input").value, "6");
            assertEq(hiddenDom.querySelector("p").innerText, "6");
            // Changing `base.b.b` will trigger all the relevant derivations, as `base.b.b` is accessed
            // via `base.b.b`.
            ++base.b.b;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("div").innerText, "14");
            assertEq(hiddenDom.querySelector("input").value, "6");
            assertEq(hiddenDom.querySelector("p").innerText, "8");
            // Changing the entire object of `base.a` won't trigger any derivations, as `base.a` is
            // accessed via `vanX.raw(base).a`.
            base.a = { a: 11, b: 12 };
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("div").innerText, "14");
            assertEq(hiddenDom.querySelector("input").value, "6");
            assertEq(hiddenDom.querySelector("p").innerText, "8");
            // Changing the entire object of `base.b` will trigger all the derivations, as `base.b` is
            // accessed via `vanX.raw(base).b`.
            base.b = { a: 13, b: 14 };
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("div").innerText, "50");
            assertEq(hiddenDom.querySelector("input").value, "24");
            assertEq(hiddenDom.querySelector("p").innerText, "26");
        }),
        list_arraySetItem: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3]);
            van.add(hiddenDom, vanX.list(ul, items, v => li(v)));
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
            items[1] = 5;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>5</li><li>3</li></ul>');
            items[2] = 6;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>5</li><li>6</li></ul>');
        }),
        list_objSetItem: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 1, b: 2, c: 3 });
            van.add(hiddenDom, vanX.list(ul, items, v => li(v)));
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
            items.b = 5;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>5</li><li>3</li></ul>');
            items.c = 6;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>5</li><li>6</li></ul>');
        }),
        list_arrayAdd: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3]);
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>');
            items.push(4);
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li><li>4<button>❌</button></li></ul>');
            items.push(5);
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li><li>4<button>❌</button></li><li>5<button>❌</button></li></ul>');
            const deleteBtns = hiddenDom.querySelectorAll("button");
            deleteBtns[3].click();
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li><li>5<button>❌</button></li></ul>');
            deleteBtns[4].click();
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>');
        }),
        list_objAdd: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 1, b: 2, c: 3 });
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>');
            items.d = 4;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li><li>4<button>❌</button></li></ul>');
            items.e = 5;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li><li>4<button>❌</button></li><li>5<button>❌</button></li></ul>');
            const deleteBtns = hiddenDom.querySelectorAll("button");
            deleteBtns[3].click();
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li><li>5<button>❌</button></li></ul>');
            deleteBtns[4].click();
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>');
        }),
        list_arrayDelete: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive(["a", "b", "c"]);
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>b<button>❌</button></li><li>c<button>❌</button></li></ul>');
            const deleteBtns = hiddenDom.querySelectorAll("button");
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>c<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "0,2");
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>c<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "2");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        list_objDelete: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: "a", b: "b", c: "c" });
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>b<button>❌</button></li><li>c<button>❌</button></li></ul>');
            const deleteBtns = hiddenDom.querySelectorAll("button");
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>c<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "a,c");
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>c<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "c");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        list_arrayRefillHoles: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3, 4, 5]);
            van.add(hiddenDom, vanX.list(ul, items, v => li(v)));
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>');
            delete items[2];
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>4</li><li>5</li></ul>');
            delete items[3];
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>5</li></ul>');
            delete items[1];
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>5</li></ul>');
            items[2] = 6;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>6</li><li>5</li></ul>');
            items[3] = 7;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>6</li><li>7</li><li>5</li></ul>');
            items[1] = 8;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>8</li><li>6</li><li>7</li><li>5</li></ul>');
        }),
        list_arrayShiftUnshift: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive(["a", "b", "c", "d", "e"]);
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>b<button>❌</button></li><li>c<button>❌</button></li><li>d<button>❌</button></li><li>e<button>❌</button></li></ul>');
            const deleteBtns = hiddenDom.querySelectorAll("button");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>b<button>❌</button></li><li>d<button>❌</button></li><li>e<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "0,1,3,4");
            items.shift();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>b<button>❌</button></li><li>d<button>❌</button></li><li>e<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "0,2,3");
            items.unshift("f");
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>f<button>❌</button></li><li>b<button>❌</button></li><li>d<button>❌</button></li><li>e<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "0,1,3,4");
        }),
        list_arraySplice: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive(["a", "b", "c", "d", "e"]);
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>b<button>❌</button></li><li>c<button>❌</button></li><li>d<button>❌</button></li><li>e<button>❌</button></li></ul>');
            const deleteBtns = hiddenDom.querySelectorAll("button");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>b<button>❌</button></li><li>d<button>❌</button></li><li>e<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "0,1,3,4");
            assertEq(items.splice(1, 1).toString(), "b");
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>d<button>❌</button></li><li>e<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "0,2,3");
            assertEq(items.splice(1, 2, "f").toString(), ",d");
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❌</button></li><li>f<button>❌</button></li><li>e<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "0,1,2");
        }),
        list_elementAs1stArgument_array: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3]);
            van.add(hiddenDom, vanX.list(ul({ class: "number-list" }), items, v => li(v)));
            assertEq(hiddenDom.innerHTML, '<ul class="number-list"><li>1</li><li>2</li><li>3</li></ul>');
            items[1] = 5;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul class="number-list"><li>1</li><li>5</li><li>3</li></ul>');
            items[2] = 6;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul class="number-list"><li>1</li><li>5</li><li>6</li></ul>');
        }),
        list_elementAs1stArgument_object: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 1, b: 2, c: 3 });
            van.add(hiddenDom, vanX.list(ul({ class: "number-list" }), items, v => li(v)));
            assertEq(hiddenDom.innerHTML, '<ul class="number-list"><li>1</li><li>2</li><li>3</li></ul>');
            items.b = 5;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul class="number-list"><li>1</li><li>5</li><li>3</li></ul>');
            items.c = 6;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul class="number-list"><li>1</li><li>5</li><li>6</li></ul>');
        }),
        list_array_multipleBindings: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3]);
            van.add(hiddenDom, vanX.list(div, items, v => div(v, button({ onclick: () => ++v.val }, "👍"))), vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<div><div>1<button>👍</button></div><div>2<button>👍</button></div><div>3<button>👍</button></div></div><ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>');
            const incBtns = hiddenDom.querySelectorAll("div button");
            const deleteBtns = hiddenDom.querySelectorAll("ul button");
            incBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div>2<button>👍</button></div><div>2<button>👍</button></div><div>3<button>👍</button></div></div><ul><li>2<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>');
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div>2<button>👍</button></div><div>3<button>👍</button></div></div><ul><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "0,2");
        }),
        list_obj_multipleBindings: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 1, b: 2, c: 3 });
            van.add(hiddenDom, vanX.list(div, items, v => div(v, button({ onclick: () => ++v.val }, "👍"))), vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<div><div>1<button>👍</button></div><div>2<button>👍</button></div><div>3<button>👍</button></div></div><ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>3<button>❌</button></li></ul>');
            const incBtns = hiddenDom.querySelectorAll("div button");
            const deleteBtns = hiddenDom.querySelectorAll("ul button");
            incBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div>1<button>👍</button></div><div>2<button>👍</button></div><div>4<button>👍</button></div></div><ul><li>1<button>❌</button></li><li>2<button>❌</button></li><li>4<button>❌</button></li></ul>');
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><div>1<button>👍</button></div><div>4<button>👍</button></div></div><ul><li>1<button>❌</button></li><li>4<button>❌</button></li></ul>');
            assertEq(Object.keys(items).toString(), "a,c");
        }),
        list_array_keyInBindingFunc: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([2, 1, 3]);
            van.add(hiddenDom, vanX.list(ul, items, (v, _deleter, k) => li(v.val, " - ", k)));
            assertEq(hiddenDom.innerHTML, '<ul><li>2 - 0</li><li>1 - 1</li><li>3 - 2</li></ul>');
            items[1] = 5;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2 - 0</li><li>5 - 1</li><li>3 - 2</li></ul>');
            items[2] = 6;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2 - 0</li><li>5 - 1</li><li>6 - 2</li></ul>');
        }),
        list_obj_keyInBindingFunc: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 2, b: 1, c: 3 });
            van.add(hiddenDom, vanX.list(ul, items, (v, _deleter, k) => li(v.val, " - ", k)));
            assertEq(hiddenDom.innerHTML, '<ul><li>2 - a</li><li>1 - b</li><li>3 - c</li></ul>');
            items.b = 5;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2 - a</li><li>5 - b</li><li>3 - c</li></ul>');
            items.c = 6;
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2 - a</li><li>5 - b</li><li>6 - c</li></ul>');
        }),
        list_forCalcField_array: withHiddenDom(async (hiddenDom) => {
            const countries = [
                "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana",
                "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela",
            ];
            const base = vanX.reactive({ filter: "" });
            const derived = vanX.reactive({
                filteredCountries: vanX.calc(() => countries.filter(c => c.toLowerCase().includes(base.filter.toLowerCase()))),
            });
            van.add(hiddenDom, div("Countries in South America. Filter: ", input({ type: "text", value: () => base.filter, oninput: e => base.filter = e.target.value })), vanX.list(ul, derived.filteredCountries, v => li(v)));
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Argentina</li><li>Bolivia</li><li>Brazil</li><li>Chile</li><li>Colombia</li><li>Ecuador</li><li>Guyana</li><li>Paraguay</li><li>Peru</li><li>Suriname</li><li>Uruguay</li><li>Venezuela</li>");
            hiddenDom.querySelector("input").value = "i";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Argentina</li><li>Bolivia</li><li>Brazil</li><li>Chile</li><li>Colombia</li><li>Suriname</li>");
            hiddenDom.querySelector("input").value = "il";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Brazil</li><li>Chile</li>");
        }),
        list_forCalcField_obj: withHiddenDom(async (hiddenDom) => {
            const countryToPopulation = {
                "Argentina": 45195777,
                "Bolivia": 11673029,
                "Brazil": 213993437,
                "Chile": 19116209,
                "Colombia": 50882884,
                "Ecuador": 17643060,
                "Guyana": 786559,
                "Paraguay": 7132530,
                "Peru": 32971846,
                "Suriname": 586634,
                "Uruguay": 3473727,
                "Venezuela": 28435943,
            };
            const base = vanX.reactive({ filter: "" });
            const derived = vanX.reactive({
                filteredCountryToPopulation: vanX.calc(() => Object.fromEntries(Object.entries(countryToPopulation).filter(([c, _]) => c.toLowerCase().includes(base.filter.toLowerCase())))),
            });
            van.add(hiddenDom, div("Population of countries in South America. Filter: ", input({ type: "text", value: () => base.filter, oninput: e => base.filter = e.target.value })), vanX.list(ul, derived.filteredCountryToPopulation, (v, _deleter, k) => li(k, ": ", v)));
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Argentina: 45195777</li><li>Bolivia: 11673029</li><li>Brazil: 213993437</li><li>Chile: 19116209</li><li>Colombia: 50882884</li><li>Ecuador: 17643060</li><li>Guyana: 786559</li><li>Paraguay: 7132530</li><li>Peru: 32971846</li><li>Suriname: 586634</li><li>Uruguay: 3473727</li><li>Venezuela: 28435943</li>");
            hiddenDom.querySelector("input").value = "i";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Argentina: 45195777</li><li>Bolivia: 11673029</li><li>Brazil: 213993437</li><li>Chile: 19116209</li><li>Colombia: 50882884</li><li>Suriname: 586634</li>");
            hiddenDom.querySelector("input").value = "il";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Brazil: 213993437</li><li>Chile: 19116209</li>");
        }),
        replace_filterArray: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3]);
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: () => ++v.val }, "👍"), a({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>');
            let incBtns = hiddenDom.querySelectorAll("button");
            incBtns[0].click();
            incBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>');
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>');
            vanX.replace(items, l => l.filter(v => v % 2 === 0));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0,1");
            // Validate increment and delete buttons still work in the new DOM tree
            incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>5<button>👍</button><a>❌</a></li></ul>');
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>5<button>👍</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "1");
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        replace_filterObj: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 1, b: 2, c: 3 });
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: () => ++v.val }, "👍"), a({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>');
            let incBtns = hiddenDom.querySelectorAll("button");
            incBtns[0].click();
            incBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>');
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>');
            vanX.replace(items, l => l.filter(([_, v]) => v % 2 === 0));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>4<button>👍</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a,c");
            // Validate increment and delete buttons still work in the new DOM tree
            incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>5<button>👍</button><a>❌</a></li></ul>');
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>5<button>👍</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "c");
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        replace_updateArray: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3]);
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: () => ++v.val }, "👍"), a({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>');
            let incBtns = hiddenDom.querySelectorAll("button");
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>');
            vanX.replace(items, l => l.map(v => v * 2));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li></ul>');
            // Validate increment and delete buttons still work in the new DOM tree
            incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[0].click();
            incBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li><li>7<button>👍</button><a>❌</a></li></ul>');
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li><li>7<button>👍</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0,2");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0");
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        replace_updateObj: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 1, b: 2, c: 3 });
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: () => ++v.val }, "👍"), a({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>2<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>');
            let incBtns = hiddenDom.querySelectorAll("button");
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li><li>3<button>👍</button><a>❌</a></li></ul>');
            vanX.replace(items, l => l.map(([k, v]) => [k, v * 2]));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li></ul>');
            // Validate increment and delete buttons still work in the new DOM tree
            incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[0].click();
            incBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li><li>6<button>👍</button><a>❌</a></li><li>7<button>👍</button><a>❌</a></li></ul>');
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li><li>7<button>👍</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a,c");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>3<button>👍</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a");
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        replace_doubleArray: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive(["a", "b"]);
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: () => v.val += "!" }, "❗"), a({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b<button>❗</button><a>❌</a></li></ul>');
            let incBtns = hiddenDom.querySelectorAll("button");
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>');
            vanX.replace(items, l => l.flatMap(v => [v, v + "-2"]));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>a-2<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li><li>b!-2<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0,1,2,3");
            // Validate increment and delete buttons still work in the new DOM tree
            incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[1].click();
            incBtns[3].click();
            incBtns[2].click();
            incBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>a-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>');
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0,2,3");
            deleteBtns[3].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0,2");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0");
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        replace_doubleObj: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: "a", b: "b" });
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: () => v.val += "!" }, "❗"), a({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b<button>❗</button><a>❌</a></li></ul>');
            let incBtns = hiddenDom.querySelectorAll("button");
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>');
            vanX.replace(items, l => l.flatMap(([k, v]) => [[k, v], [k + "-2", v + "-2"]]));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>a-2<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li><li>b!-2<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a,a-2,b,b-2");
            // Validate increment and delete buttons still work in the new DOM tree
            incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[1].click();
            incBtns[3].click();
            incBtns[2].click();
            incBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>a-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>');
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a,b,b-2");
            deleteBtns[3].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a,b");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a");
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        replace_doubleArray_prepend: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive(["a", "b"]);
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: () => v.val += "!" }, "❗"), a({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b<button>❗</button><a>❌</a></li></ul>');
            let incBtns = hiddenDom.querySelectorAll("button");
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>');
            vanX.replace(items, l => l.flatMap(v => [v + "-2", v]));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2<button>❗</button><a>❌</a></li><li>a<button>❗</button><a>❌</a></li><li>b!-2<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>');
            // Validate increment and delete buttons still work in the new DOM tree
            incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[1].click();
            incBtns[3].click();
            incBtns[2].click();
            incBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>a!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>');
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0,2,3");
            deleteBtns[3].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0,2");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "0");
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        replace_doubleObj_prepend: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: "a", b: "b" });
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(v, button({ onclick: () => v.val += "!" }, "❗"), a({ onclick: deleter }, "❌"))));
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b<button>❗</button><a>❌</a></li></ul>');
            let incBtns = hiddenDom.querySelectorAll("button");
            incBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>');
            vanX.replace(items, l => l.flatMap(([k, v]) => [[k + "-2", v + "-2"], [k, v]]));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2<button>❗</button><a>❌</a></li><li>a<button>❗</button><a>❌</a></li><li>b!-2<button>❗</button><a>❌</a></li><li>b!<button>❗</button><a>❌</a></li></ul>');
            // Validate increment and delete buttons still work in the new DOM tree
            incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[1].click();
            incBtns[3].click();
            incBtns[2].click();
            incBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>a!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>');
            deleteBtns[1].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li><li>b!!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a-2,b-2,b");
            deleteBtns[3].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li><li>b!-2!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a-2,b-2");
            deleteBtns[2].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>a-2!<button>❗</button><a>❌</a></li></ul>');
            assertEq(Object.keys(items).toString(), "a-2");
            deleteBtns[0].click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul></ul>');
            assertEq(Object.keys(items).toString(), "");
        }),
        replace_sortArray: withHiddenDom(async (hiddenDom) => {
            const arr = Array.from({ length: 10 }).map((_, i) => i);
            const shuffled = shuffle(arr);
            const items = vanX.reactive([10, ...shuffled].map(v => v.toString()));
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(span(v), button({ onclick: () => v.val += "!" }, "❗"), a({ onclick: deleter }, "❌"))));
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), [10, ...shuffled].toString());
            hiddenDom.querySelector("a").click();
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), [...shuffled].toString());
            vanX.replace(items, l => l.toSorted());
            await sleep(waitMsForDerivations);
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), arr.toString());
            // Validate increment and delete buttons still work in the new DOM tree
            const incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[2].click();
            incBtns[5].click();
            await sleep(waitMsForDerivations);
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), "0,1,2!,3,4,5!,6,7,8,9");
            deleteBtns[6].click();
            deleteBtns[8].click();
            await sleep(waitMsForDerivations);
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), "0,1,2!,3,4,5!,7,9");
        }),
        replace_sortObj: withHiddenDom(async (hiddenDom) => {
            const arr = Array.from({ length: 10 }).map((_, i) => i);
            const shuffled = shuffle(arr);
            const items = vanX.reactive(Object.fromEntries([["k", "10"], ...shuffled.map(v => ["k" + v, v.toString()])]));
            van.add(hiddenDom, vanX.list(ul, items, (v, deleter) => li(span(v), button({ onclick: () => v.val += "!" }, "❗"), a({ onclick: deleter }, "❌"))));
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), [10, shuffled].toString());
            hiddenDom.querySelector("a").click();
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), [...shuffled].toString());
            vanX.replace(items, kvs => kvs.toSorted(([_1, v1], [_2, v2]) => v1.localeCompare(v2)));
            await sleep(waitMsForDerivations);
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), arr.toString());
            // Validate increment and delete buttons still work in the new DOM tree
            const incBtns = hiddenDom.querySelectorAll("button");
            const deleteBtns = hiddenDom.querySelectorAll("a");
            incBtns[2].click();
            incBtns[5].click();
            await sleep(waitMsForDerivations);
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), "0,1,2!,3,4,5!,6,7,8,9");
            deleteBtns[6].click();
            deleteBtns[8].click();
            await sleep(waitMsForDerivations);
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).toString(), "0,1,2!,3,4,5!,7,9");
        }),
        replace_nestedArray: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([{
                    foo: 'bar',
                    baz: { kind: 'dessert', amount: 'lots' }
                }]);
            van.add(hiddenDom, vanX.list(ul, items, ({ val: v }) => li(v.baz.kind)));
            assertEq(hiddenDom.innerHTML, '<ul><li>dessert</li></ul>');
            items[0].baz.kind = "candy";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>candy</li></ul>');
            vanX.replace(items, () => [{
                    foo: 'bar',
                    baz: { kind: 'dessert', amount: 'lots' }
                }]);
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>dessert</li></ul>');
            items[0].baz.kind = "candy";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>candy</li></ul>');
        }),
        replace_nestedObj: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({
                a: {
                    foo: 'bar',
                    baz: { kind: 'dessert', amount: 'lots' }
                },
            });
            van.add(hiddenDom, vanX.list(ul, items, ({ val: v }) => li(v.baz.kind)));
            assertEq(hiddenDom.innerHTML, '<ul><li>dessert</li></ul>');
            items.a.baz.kind = "candy";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>candy</li></ul>');
            vanX.replace(items, () => [["a", {
                        foo: 'bar',
                        baz: { kind: 'dessert', amount: 'lots' }
                    }]]);
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>dessert</li></ul>');
            items.a.baz.kind = "candy";
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>candy</li></ul>');
        }),
        replaceInSideEffect_array: withHiddenDom(async (hiddenDom) => {
            const countries = [
                "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana",
                "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela",
            ];
            const filter = van.state("");
            const filteredCountries = vanX.reactive([]);
            van.derive(() => vanX.replace(filteredCountries, () => countries.filter(c => c.toLowerCase().includes(filter.val.toLowerCase()))));
            van.add(hiddenDom, div("Countries in South America. Filter: ", input({ type: "text", value: filter, oninput: e => filter.val = e.target.value })), vanX.list(ul, filteredCountries, v => li(v)));
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Argentina</li><li>Bolivia</li><li>Brazil</li><li>Chile</li><li>Colombia</li><li>Ecuador</li><li>Guyana</li><li>Paraguay</li><li>Peru</li><li>Suriname</li><li>Uruguay</li><li>Venezuela</li>");
            hiddenDom.querySelector("input").value = "i";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Argentina</li><li>Bolivia</li><li>Brazil</li><li>Chile</li><li>Colombia</li><li>Suriname</li>");
            hiddenDom.querySelector("input").value = "il";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Brazil</li><li>Chile</li>");
        }),
        replaceInSideEffect_obj: withHiddenDom(async (hiddenDom) => {
            const countryToPopulation = {
                "Argentina": 45195777,
                "Bolivia": 11673029,
                "Brazil": 213993437,
                "Chile": 19116209,
                "Colombia": 50882884,
                "Ecuador": 17643060,
                "Guyana": 786559,
                "Paraguay": 7132530,
                "Peru": 32971846,
                "Suriname": 586634,
                "Uruguay": 3473727,
                "Venezuela": 28435943,
            };
            const filter = van.state("");
            const filteredCountryToPopulation = vanX.reactive({});
            van.derive(() => vanX.replace(filteredCountryToPopulation, () => Object.entries(countryToPopulation).filter(([c, _]) => c.toLowerCase().includes(filter.val.toLowerCase()))));
            van.add(hiddenDom, div("Population of countries in South America. Filter: ", input({ type: "text", value: filter, oninput: e => filter.val = e.target.value })), vanX.list(ul, filteredCountryToPopulation, (v, _deleter, k) => li(k, ": ", v)));
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Argentina: 45195777</li><li>Bolivia: 11673029</li><li>Brazil: 213993437</li><li>Chile: 19116209</li><li>Colombia: 50882884</li><li>Ecuador: 17643060</li><li>Guyana: 786559</li><li>Paraguay: 7132530</li><li>Peru: 32971846</li><li>Suriname: 586634</li><li>Uruguay: 3473727</li><li>Venezuela: 28435943</li>");
            hiddenDom.querySelector("input").value = "i";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Argentina: 45195777</li><li>Bolivia: 11673029</li><li>Brazil: 213993437</li><li>Chile: 19116209</li><li>Colombia: 50882884</li><li>Suriname: 586634</li>");
            hiddenDom.querySelector("input").value = "il";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.querySelector("ul").innerHTML, "<li>Brazil: 213993437</li><li>Chile: 19116209</li>");
        }),
        replace_smartUpdate: withHiddenDom(async (hiddenDom) => {
            const data = vanX.reactive({ name: undefined });
            let numDivRendered = 0;
            van.add(hiddenDom, () => {
                ++numDivRendered;
                if (!data.name)
                    return div("Enter your name...");
                return div(() => data.name?.first, " ", () => data.name?.last);
            });
            assertEq(hiddenDom.innerHTML, '<div>Enter your name...</div>');
            assertEq(numDivRendered, 1);
            vanX.replace(data, { name: { first: "Tao", last: "Xin" } });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Tao Xin</div>');
            // <div> will be re-rendered as the entire `base.name` was assigned to some value from
            // `undefined`.
            assertEq(numDivRendered, 2);
            vanX.replace(data, { name: { first: "Oliver", last: "Xin" } });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Oliver Xin</div>');
            // <div> won't be re-rendered as `vanX.replace` only replaces leaf-level fields
            assertEq(numDivRendered, 2);
            vanX.replace(data, { name: { first: "Oliver", last: "Smith" } });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Oliver Smith</div>');
            // <div> won't be re-rendered as `vanX.replace` only replaces leaf-level fields
            assertEq(numDivRendered, 2);
            vanX.replace(data, { name: undefined });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Enter your name...</div>');
            // <div> will be re-rendered as the entire `base.name` became `undefined`
            assertEq(numDivRendered, 3);
            vanX.replace(data, { name: { first: "Tao", last: "Xin" } });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div>Tao Xin</div>');
            // <div> will be re-rendered as the entire `base.name` was assigned to some value from
            // `undefined`.
            assertEq(numDivRendered, 4);
        }),
        replace_smartUpdate_listForArray: withHiddenDom(async (hiddenDom) => {
            const sampleItems = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
            const data = vanX.reactive({
                newItem: "",
                items: sampleItems.map(t => ({ text: t, done: false })),
            });
            van.add(hiddenDom, div(input({ type: "text", value: () => data.newItem, oninput: e => data.newItem = e.target.value }), button({ onclick: () => data.items.push({ text: data.newItem, done: false }) }, "Add"), vanX.list(div, data.items, ({ val: v }, deleter) => div(input({ type: "checkbox", checked: () => v.done, onclick: e => v.done = e.target.checked }), () => (v.done ? del : span)(v.text), a({ onclick: deleter }, "❌")))));
            assertEq(hiddenDom.innerHTML, '<div><input type="text"><button>Add</button><div><div><input type="checkbox"><span>Item 1</span><a>❌</a></div><div><input type="checkbox"><span>Item 2</span><a>❌</a></div><div><input type="checkbox"><span>Item 3</span><a>❌</a></div><div><input type="checkbox"><span>Item 4</span><a>❌</a></div><div><input type="checkbox"><span>Item 5</span><a>❌</a></div></div></div>');
            assertEq(hiddenDom.querySelector("input").value, "");
            hiddenDom.querySelector("input").value = "Item 6";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            assertEq(data.newItem, "Item 6");
            vanX.replace(data, { ...data, newItem: "Item 7" });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><input type="text"><button>Add</button><div><div><input type="checkbox"><span>Item 1</span><a>❌</a></div><div><input type="checkbox"><span>Item 2</span><a>❌</a></div><div><input type="checkbox"><span>Item 3</span><a>❌</a></div><div><input type="checkbox"><span>Item 4</span><a>❌</a></div><div><input type="checkbox"><span>Item 5</span><a>❌</a></div></div></div>');
            assertEq(hiddenDom.querySelector("input").value, "Item 7");
            hiddenDom.querySelector("button").click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><input type="text"><button>Add</button><div><div><input type="checkbox"><span>Item 1</span><a>❌</a></div><div><input type="checkbox"><span>Item 2</span><a>❌</a></div><div><input type="checkbox"><span>Item 3</span><a>❌</a></div><div><input type="checkbox"><span>Item 4</span><a>❌</a></div><div><input type="checkbox"><span>Item 5</span><a>❌</a></div><div><input type="checkbox"><span>Item 7</span><a>❌</a></div></div></div>');
            assertEq(hiddenDom.querySelector("input").value, "Item 7");
            // Delete 2 items randomly
            {
                const deleteBtns = [...hiddenDom.querySelectorAll("a")];
                deleteBtns[Math.floor(Math.random() * deleteBtns.length)].click();
            }
            {
                const deleteBtns = [...hiddenDom.querySelectorAll("a")];
                deleteBtns[Math.floor(Math.random() * deleteBtns.length)].click();
            }
            await sleep(waitMsForDerivations);
            assertEq(Object.keys(data.items).length, 4);
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).join(","), data.items.map(i => i.text).filter(_ => 1).join(","));
            assertEq(hiddenDom.querySelector("input").value, "Item 7");
            // Replace the items back
            vanX.replace(data, {
                newItem: "",
                items: sampleItems.map(t => ({ text: t, done: false })),
            });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><input type="text"><button>Add</button><div><div><input type="checkbox"><span>Item 1</span><a>❌</a></div><div><input type="checkbox"><span>Item 2</span><a>❌</a></div><div><input type="checkbox"><span>Item 3</span><a>❌</a></div><div><input type="checkbox"><span>Item 4</span><a>❌</a></div><div><input type="checkbox"><span>Item 5</span><a>❌</a></div></div></div>');
            assertEq(hiddenDom.querySelector("input").value, "");
            const rowDoms = [...hiddenDom.querySelectorAll("div div div div")];
            // Randomly flip the `done`-status of items
            for (let iter = 0; iter < 5; ++iter) {
                vanX.replace(data, {
                    newItem: "",
                    items: sampleItems.map(t => ({ text: t, done: Math.random() >= 0.5 })),
                });
                await sleep(waitMsForDerivations);
                // Validate the DOM elements for rows aren't changed
                const newRowDoms = [...hiddenDom.querySelectorAll("div div div div")];
                assertEq(newRowDoms.length, rowDoms.length);
                for (let i = 0; i < newRowDoms.length; ++i)
                    assertEq(newRowDoms[i], rowDoms[i]);
                // Validate the `done`-status in each row
                for (let i = 0; i < newRowDoms.length; ++i) {
                    assertEq(newRowDoms[i].querySelector("input").checked, data.items[i].done);
                    if (data.items[i].done) {
                        assertEq(newRowDoms[i].querySelector("span"), null);
                        assertEq(newRowDoms[i].querySelector("del").innerText, data.items[i].text);
                    }
                    else {
                        assertEq(newRowDoms[i].querySelector("del"), null);
                        assertEq(newRowDoms[i].querySelector("span").innerText, data.items[i].text);
                    }
                }
            }
        }),
        replace_smartUpdate_listForObj: withHiddenDom(async (hiddenDom) => {
            const sampleItems = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
            const data = vanX.reactive({
                newItem: "",
                items: Object.fromEntries(sampleItems.map((t, i) => ["k" + i, { text: t, done: false }])),
            });
            let id = 10;
            van.add(hiddenDom, div(input({ type: "text", value: () => data.newItem, oninput: e => data.newItem = e.target.value }), button({ onclick: () => data.items["k" + ++id] = { text: data.newItem, done: false } }, "Add"), vanX.list(div, data.items, ({ val: v }, deleter, key) => div(input({ type: "checkbox", checked: () => v.done, onclick: e => v.done = e.target.checked }), () => (v.done ? del : span)(key, " - ", v.text), a({ onclick: deleter }, "❌")))));
            assertEq(hiddenDom.innerHTML, '<div><input type="text"><button>Add</button><div><div><input type="checkbox"><span>k0 - Item 1</span><a>❌</a></div><div><input type="checkbox"><span>k1 - Item 2</span><a>❌</a></div><div><input type="checkbox"><span>k2 - Item 3</span><a>❌</a></div><div><input type="checkbox"><span>k3 - Item 4</span><a>❌</a></div><div><input type="checkbox"><span>k4 - Item 5</span><a>❌</a></div></div></div>');
            assertEq(hiddenDom.querySelector("input").value, "");
            hiddenDom.querySelector("input").value = "Item 6";
            hiddenDom.querySelector("input").dispatchEvent(new Event("input"));
            assertEq(data.newItem, "Item 6");
            vanX.replace(data, { ...data, newItem: "Item 7" });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><input type="text"><button>Add</button><div><div><input type="checkbox"><span>k0 - Item 1</span><a>❌</a></div><div><input type="checkbox"><span>k1 - Item 2</span><a>❌</a></div><div><input type="checkbox"><span>k2 - Item 3</span><a>❌</a></div><div><input type="checkbox"><span>k3 - Item 4</span><a>❌</a></div><div><input type="checkbox"><span>k4 - Item 5</span><a>❌</a></div></div></div>');
            assertEq(hiddenDom.querySelector("input").value, "Item 7");
            hiddenDom.querySelector("button").click();
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><input type="text"><button>Add</button><div><div><input type="checkbox"><span>k0 - Item 1</span><a>❌</a></div><div><input type="checkbox"><span>k1 - Item 2</span><a>❌</a></div><div><input type="checkbox"><span>k2 - Item 3</span><a>❌</a></div><div><input type="checkbox"><span>k3 - Item 4</span><a>❌</a></div><div><input type="checkbox"><span>k4 - Item 5</span><a>❌</a></div><div><input type="checkbox"><span>k11 - Item 7</span><a>❌</a></div></div></div>');
            assertEq(hiddenDom.querySelector("input").value, "Item 7");
            // Delete 2 items randomly
            {
                const deleteBtns = [...hiddenDom.querySelectorAll("a")];
                deleteBtns[Math.floor(Math.random() * deleteBtns.length)].click();
            }
            {
                const deleteBtns = [...hiddenDom.querySelectorAll("a")];
                deleteBtns[Math.floor(Math.random() * deleteBtns.length)].click();
            }
            await sleep(waitMsForDerivations);
            assertEq(Object.keys(data.items).length, 4);
            assertEq([...hiddenDom.querySelectorAll("span")].map(e => e.innerText).join(","), Object.entries(data.items).map(([k, { text }]) => `${k} - ${text}`).join(","));
            assertEq(hiddenDom.querySelector("input").value, "Item 7");
            // Replace the items back
            vanX.replace(data, {
                newItem: "",
                items: Object.fromEntries(sampleItems.map((t, i) => ["k" + i, { text: t, done: false }])),
            });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<div><input type="text"><button>Add</button><div><div><input type="checkbox"><span>k0 - Item 1</span><a>❌</a></div><div><input type="checkbox"><span>k1 - Item 2</span><a>❌</a></div><div><input type="checkbox"><span>k2 - Item 3</span><a>❌</a></div><div><input type="checkbox"><span>k3 - Item 4</span><a>❌</a></div><div><input type="checkbox"><span>k4 - Item 5</span><a>❌</a></div></div></div>');
            assertEq(hiddenDom.querySelector("input").value, "");
            const rowDoms = [...hiddenDom.querySelectorAll("div div div div")];
            // Randomly flip the `done`-status of items
            for (let iter = 0; iter < 5; ++iter) {
                vanX.replace(data, {
                    newItem: "",
                    items: Object.fromEntries(sampleItems.map((t, i) => ["k" + i, { text: t, done: Math.random() >= 0.5 }])),
                });
                await sleep(waitMsForDerivations);
                // Validate the DOM elements for rows aren't changed
                const newRowDoms = [...hiddenDom.querySelectorAll("div div div div")];
                assertEq(newRowDoms.length, rowDoms.length);
                for (let i = 0; i < newRowDoms.length; ++i)
                    assertEq(newRowDoms[i], rowDoms[i]);
                for (let i = 0; i < newRowDoms.length; ++i) {
                    // Validate the text and `done`-status in each row
                    const key = "k" + i;
                    assertEq(newRowDoms[i].querySelector("input").checked, data.items[key].done);
                    if (data.items[key].done) {
                        assertEq(newRowDoms[i].querySelector("span"), null);
                        assertEq(newRowDoms[i].querySelector("del").innerText, key + " - " + data.items[key].text);
                    }
                    else {
                        assertEq(newRowDoms[i].querySelector("del"), null);
                        assertEq(newRowDoms[i].querySelector("span").innerText, key + " - " + data.items[key].text);
                    }
                }
            }
            // Randomly flip the `done`-status of items + reordering
            for (let iter = 0; iter < 5; ++iter) {
                vanX.replace(data, {
                    newItem: "",
                    items: Object.fromEntries(shuffle(sampleItems.map((t, i) => ["k" + i, { text: t, done: Math.random() >= 0.5 }]))),
                });
                await sleep(waitMsForDerivations);
                const newRowDoms = [...hiddenDom.querySelectorAll("div div div div")];
                assertEq(newRowDoms.length, rowDoms.length);
                for (let i = 0; i < newRowDoms.length; ++i) {
                    // Validate the text and `done`-status in each row
                    const key = Object.keys(data.items)[i];
                    assertEq(newRowDoms[i].querySelector("input").checked, data.items[key].done);
                    if (data.items[key].done) {
                        assertEq(newRowDoms[i].querySelector("span"), null);
                        assertEq(newRowDoms[i].querySelector("del").innerText, key + " - " + data.items[key].text);
                    }
                    else {
                        assertEq(newRowDoms[i].querySelector("del"), null);
                        assertEq(newRowDoms[i].querySelector("span").innerText, key + " - " + data.items[key].text);
                    }
                    // Validate the DOM element isn't changed (just moved from a different location)
                    assertEq(newRowDoms[i], rowDoms[Number(key.substring(1))]);
                }
            }
        }),
        compact_basic: () => {
            const data = vanX.reactive([1, 2, 3, 4, 5]);
            assertEq(JSON.stringify(vanX.compact(data)), "[1,2,3,4,5]");
            delete data[2];
            assertEq(JSON.stringify(vanX.compact(data)), "[1,2,4,5]");
            delete data[1];
            assertEq(JSON.stringify(vanX.compact(data)), "[1,4,5]");
            delete data[3];
            assertEq(JSON.stringify(vanX.compact(data)), "[1,5]");
        },
        compact_nested: () => {
            const data = vanX.reactive({
                list: [1, 2, 3, 4, 5],
                group: {
                    list1: [11, 12, 13],
                    list2: [14, 15],
                },
                listOfLists: [
                    [1],
                    [1, 2],
                    [1, 2, 3],
                ],
                listOfObjs: [
                    { first: "Tao", last: "Xin" },
                    { first: "Vanilla", last: "JavaScript" },
                    { first: "Van", last: "JS" },
                ],
                others: {
                    line1: "This is irrelevant",
                    line2: 56789,
                },
            });
            assertEq(JSON.stringify(vanX.compact(data)), '{"list":[1,2,3,4,5],"group":{"list1":[11,12,13],"list2":[14,15]},"listOfLists":[[1],[1,2],[1,2,3]],"listOfObjs":[{"first":"Tao","last":"Xin"},{"first":"Vanilla","last":"JavaScript"},{"first":"Van","last":"JS"}],"others":{"line1":"This is irrelevant","line2":56789}}');
            delete data.list[3];
            assertEq(JSON.stringify(vanX.compact(data)), '{"list":[1,2,3,5],"group":{"list1":[11,12,13],"list2":[14,15]},"listOfLists":[[1],[1,2],[1,2,3]],"listOfObjs":[{"first":"Tao","last":"Xin"},{"first":"Vanilla","last":"JavaScript"},{"first":"Van","last":"JS"}],"others":{"line1":"This is irrelevant","line2":56789}}');
            delete data.group.list1[2];
            assertEq(JSON.stringify(vanX.compact(data)), '{"list":[1,2,3,5],"group":{"list1":[11,12],"list2":[14,15]},"listOfLists":[[1],[1,2],[1,2,3]],"listOfObjs":[{"first":"Tao","last":"Xin"},{"first":"Vanilla","last":"JavaScript"},{"first":"Van","last":"JS"}],"others":{"line1":"This is irrelevant","line2":56789}}');
            delete data.group.list2[0];
            assertEq(JSON.stringify(vanX.compact(data)), '{"list":[1,2,3,5],"group":{"list1":[11,12],"list2":[15]},"listOfLists":[[1],[1,2],[1,2,3]],"listOfObjs":[{"first":"Tao","last":"Xin"},{"first":"Vanilla","last":"JavaScript"},{"first":"Van","last":"JS"}],"others":{"line1":"This is irrelevant","line2":56789}}');
            delete data.listOfLists[0][0];
            assertEq(JSON.stringify(vanX.compact(data)), '{"list":[1,2,3,5],"group":{"list1":[11,12],"list2":[15]},"listOfLists":[[],[1,2],[1,2,3]],"listOfObjs":[{"first":"Tao","last":"Xin"},{"first":"Vanilla","last":"JavaScript"},{"first":"Van","last":"JS"}],"others":{"line1":"This is irrelevant","line2":56789}}');
            delete data.listOfLists[1];
            assertEq(JSON.stringify(vanX.compact(data)), '{"list":[1,2,3,5],"group":{"list1":[11,12],"list2":[15]},"listOfLists":[[],[1,2,3]],"listOfObjs":[{"first":"Tao","last":"Xin"},{"first":"Vanilla","last":"JavaScript"},{"first":"Van","last":"JS"}],"others":{"line1":"This is irrelevant","line2":56789}}');
            delete data.listOfLists[2][2];
            assertEq(JSON.stringify(vanX.compact(data)), '{"list":[1,2,3,5],"group":{"list1":[11,12],"list2":[15]},"listOfLists":[[],[1,2]],"listOfObjs":[{"first":"Tao","last":"Xin"},{"first":"Vanilla","last":"JavaScript"},{"first":"Van","last":"JS"}],"others":{"line1":"This is irrelevant","line2":56789}}');
            delete data.listOfObjs[0];
            assertEq(JSON.stringify(vanX.compact(data)), '{"list":[1,2,3,5],"group":{"list1":[11,12],"list2":[15]},"listOfLists":[[],[1,2]],"listOfObjs":[{"first":"Vanilla","last":"JavaScript"},{"first":"Van","last":"JS"}],"others":{"line1":"This is irrelevant","line2":56789}}');
            delete data.listOfObjs[1];
            assertEq(JSON.stringify(vanX.compact(data)), '{"list":[1,2,3,5],"group":{"list1":[11,12],"list2":[15]},"listOfLists":[[],[1,2]],"listOfObjs":[{"first":"Van","last":"JS"}],"others":{"line1":"This is irrelevant","line2":56789}}');
        }
    };
    const gcTests = {
        list_activeGc_array: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3]), states = vanX.stateFields(items);
            const bindingSymbol = Object.getOwnPropertySymbols(states).find(k => Array.isArray(states[k]));
            const ordered = van.state(false);
            van.add(hiddenDom, () => vanX.list(ordered.val ? ol : ul, items, v => li(v)));
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
            for (let i = 0; i < 10; ++i) {
                ordered.val = !ordered.val;
                await sleep(waitMsForDerivations);
                assertEq(hiddenDom.innerHTML, ordered.val ?
                    '<ol><li>1</li><li>2</li><li>3</li></ol>' :
                    '<ul><li>1</li><li>2</li><li>3</li></ul>');
            }
            // Trigger the GC
            vanX.replace(items, [...items]);
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
            assertEq(states[bindingSymbol].length, 1);
        }),
        list_activeGc_obj: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 1, b: 2, c: 3 }), states = vanX.stateFields(items);
            const bindingSymbol = Object.getOwnPropertySymbols(states).find(k => Array.isArray(states[k]));
            const ordered = van.state(false);
            van.add(hiddenDom, () => vanX.list(ordered.val ? ol : ul, items, v => li(v)));
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
            for (let i = 0; i < 10; ++i) {
                ordered.val = !ordered.val;
                await sleep(waitMsForDerivations);
                assertEq(hiddenDom.innerHTML, ordered.val ?
                    '<ol><li>1</li><li>2</li><li>3</li></ol>' :
                    '<ul><li>1</li><li>2</li><li>3</li></ul>');
            }
            // Trigger the GC
            vanX.replace(items, { b: 2, a: 1, c: 3 });
            await sleep(waitMsForDerivations);
            assertEq(hiddenDom.innerHTML, '<ul><li>2</li><li>1</li><li>3</li></ul>');
            assertEq(states[bindingSymbol].length, 1);
        }),
        list_keyToChild_array: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3, 4, 5]);
            const dom = hiddenDom.appendChild(vanX.list(ul, items, ({ val: v }) => li(v)));
            const [keyToChildSym] = Object.getOwnPropertySymbols(dom);
            assertEq(dom.innerHTML, '<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
            const childDom = [...dom.childNodes][1];
            items[1] = 6;
            await sleep(waitMsForDerivations);
            assertEq(dom.innerHTML, '<li>1</li><li>6</li><li>3</li><li>4</li><li>5</li>');
            assert([...dom.childNodes][1] !== childDom);
            assertEq(dom[keyToChildSym][1], [...dom.childNodes][1]);
            assertEq(Object.keys(dom[keyToChildSym]).join(","), "0,1,2,3,4");
            delete items[2];
            await sleep(waitMsForDerivations);
            assertEq(dom.innerHTML, '<li>1</li><li>6</li><li>4</li><li>5</li>');
            assertEq(Object.keys(dom[keyToChildSym]).join(","), "0,1,3,4");
            delete items[3];
            await sleep(waitMsForDerivations);
            assertEq(dom.innerHTML, '<li>1</li><li>6</li><li>5</li>');
            assertEq(Object.keys(dom[keyToChildSym]).join(","), "0,1,4");
            items.push(7);
            await sleep(waitMsForDerivations);
            assertEq(dom.innerHTML, '<li>1</li><li>6</li><li>5</li><li>7</li>');
            assertEq(Object.keys(dom[keyToChildSym]).join(","), "0,1,4,5");
        }),
        list_keyToChild_obj: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 1, b: 2, c: 3, d: 4, e: 5 });
            const dom = hiddenDom.appendChild(vanX.list(ul, items, ({ val: v }) => li(v)));
            const [keyToChildSym] = Object.getOwnPropertySymbols(dom);
            assertEq(dom.innerHTML, '<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
            const childDom = [...dom.childNodes][1];
            items.b = 6;
            await sleep(waitMsForDerivations);
            assertEq(dom.innerHTML, '<li>1</li><li>6</li><li>3</li><li>4</li><li>5</li>');
            assert([...dom.childNodes][1] !== childDom);
            assertEq(dom[keyToChildSym]["b"], [...dom.childNodes][1]);
            assertEq(Object.keys(dom[keyToChildSym]).join(","), "a,b,c,d,e");
            delete items.c;
            await sleep(waitMsForDerivations);
            assertEq(dom.innerHTML, '<li>1</li><li>6</li><li>4</li><li>5</li>');
            assertEq(Object.keys(dom[keyToChildSym]).join(","), "a,b,d,e");
            delete items.d;
            await sleep(waitMsForDerivations);
            assertEq(dom.innerHTML, '<li>1</li><li>6</li><li>5</li>');
            assertEq(Object.keys(dom[keyToChildSym]).join(","), "a,b,e");
            items.f = 7;
            await sleep(waitMsForDerivations);
            assertEq(dom.innerHTML, '<li>1</li><li>6</li><li>5</li><li>7</li>');
            assertEq(Object.keys(dom[keyToChildSym]).join(","), "a,b,e,f");
        }),
        list_passiveGc_array: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive([1, 2, 3]), states = vanX.stateFields(items);
            const bindingSymbol = Object.getOwnPropertySymbols(states).find(k => Array.isArray(states[k]));
            const ordered = van.state(false);
            van.add(hiddenDom, () => vanX.list(ordered.val ? ol : ul, items, v => li(v)));
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
            for (let i = 0; i < 10; ++i) {
                ordered.val = !ordered.val;
                await sleep(waitMsForDerivations);
                assertEq(hiddenDom.innerHTML, ordered.val ?
                    '<ol><li>1</li><li>2</li><li>3</li></ol>' :
                    '<ul><li>1</li><li>2</li><li>3</li></ul>');
            }
            // Wait for the GC to be triggered
            await sleep(1000);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
            assertEq(states[bindingSymbol].length, 1);
        }),
        list_passiveGc_obj: withHiddenDom(async (hiddenDom) => {
            const items = vanX.reactive({ a: 1, b: 2, c: 3 }), states = vanX.stateFields(items);
            const bindingSymbol = Object.getOwnPropertySymbols(states).find(k => Array.isArray(states[k]));
            const ordered = van.state(false);
            van.add(hiddenDom, () => vanX.list(ordered.val ? ol : ul, items, v => li(v)));
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
            for (let i = 0; i < 10; ++i) {
                ordered.val = !ordered.val;
                await sleep(waitMsForDerivations);
                assertEq(hiddenDom.innerHTML, ordered.val ?
                    '<ol><li>1</li><li>2</li><li>3</li></ol>' :
                    '<ul><li>1</li><li>2</li><li>3</li></ul>');
            }
            // Wait for the GC to be triggered
            await sleep(1000);
            assertEq(hiddenDom.innerHTML, '<ul><li>1</li><li>2</li><li>3</li></ul>');
            assertEq(states[bindingSymbol].length, 1);
        }),
    };
    const suites = { tests, gcTests };
    const msgDom = van.add(document.getElementById("msgPanel"), h2("Running tests for ", file))
        .appendChild(div({ class: "testMsg" }));
    for (const [k, v] of Object.entries(suites)) {
        for (const [name, func] of Object.entries(v)) {
            ++window.numTests;
            const result = van.state(""), msg = van.state("");
            van.add(msgDom, div(pre(`Running ${k}.${name}...`), pre(result), pre(" "), pre(button({ onclick: async () => {
                    try {
                        await func();
                        result.val = "✅";
                        msg.val = "Rerun succeeded!";
                    }
                    catch (e) {
                        result.val = "❌";
                        msg.val = "Rerun failed!";
                        throw e;
                    }
                } }, "Rerun this test")), pre(" "), pre(msg)));
            try {
                await func();
                result.val = "✅";
            }
            catch (e) {
                result.val = "❌";
                van.add(msgDom, div({ style: "color: red" }, "Test failed, please check console for error message."));
                throw e;
            }
        }
    }
};
