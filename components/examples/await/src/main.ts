import van from "vanjs-core"
import {Await} from "vanjs-ui"

const {button, div, h2, p, span} = van.tags

const Example1 = () => {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const fetchWithDelay = (url: string, waitMs: number) =>
    sleep(waitMs).then(() => fetch(url)).then(r => r.json())

  const fetchStar = () =>
    fetchWithDelay("https://api.github.com/repos/vanjs-org/van", 1000)
      .then(data => data.stargazers_count)

  const data = van.state(fetchStar())

  return [
    () => h2(
      "Github Star: ",
      Await({
        value: data.val, container: span,
        Loading: () => "🌀 Loading...",
        Error: () => "🙀 Request failed.",
      }, starNumber => `⭐️ ${starNumber}!`)
    ),
    () => Await({
      value: data.val,
      Loading: () => '',
    }, () => button({onclick: () => (data.val = fetchStar())}, "Refetch")),
  ]
}

const Example2 = () => {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const loadNumber = () =>
    sleep(Math.random() * 1000).then(() => Math.floor(Math.random() * 10))

  const a = van.state(loadNumber()), b = van.state(loadNumber())

  return [
    h2("Parallel Await"),
    () => {
      const sum = van.derive(() => Promise.all([a.val, b.val]).then(([a, b]) => a + b))
      return Await({
        value: sum.val,
        Loading: () => div(
          Await({value: a.val, Loading: () => "🌀 Loading a..."}, () => "Done"),
          Await({value: b.val, Loading: () => "🌀 Loading b..."}, () => "Done"),
        ),
      }, sum => "a + b = " + sum)
    },
    p(button({onclick: () => (a.val = loadNumber(), b.val = loadNumber())}, "Reload")),
  ]
}

van.add(document.body, Example1(), Example2())
