import van from 'vanjs-core';
import { Await } from 'vanjs-ui';

const { div, h2, span, button } = van.tags;

async function fetchWithDelay<Result>(
  url: string,
  wait: number
): Promise<Result> {
  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  await delay(wait);
  const response = await fetch(url);
  return response.json();
}

const fetchStar = () =>
  fetchWithDelay<{ stargazers_count: number }>(
    'https://api.github.com/repos/vanjs-org/van',
    1000
  ).then((data) => data.stargazers_count);

function App() {
  const data = van.state(fetchStar());

  return [
    () =>
      h2(
        'Github Star: ',
        Await(
          {
            value: data.val,
            Loading: () => `🌀 Loading...`,
            Error: () => `🙀 Request failed.`,
          },
          (starNumber) => span(`🎉 ${starNumber}!`)
        )
      ),
    () =>
      div(
        Await(
          {
            value: data.val,
            Loading: () => '',
          },
          () => button({ onclick: () => (data.val = fetchStar()) }, 'refetch')
        )
      ),
  ];
}

van.add(document.body, App());
