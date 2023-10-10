# Quick Start

_Author: [cqh](https://github.com/cqh963852)_

## Stackblitz Demo

https://stackblitz.com/edit/vitejs-vite-zepzmw?embed=1&file=src%2Fmain.tsx

## Create a New Project

```
# yarn
yarn create vite my-van-jsx --template vanilla-ts
```

```
# yarn
yarn add vanjs-jsx vanjs-core
```

- Change tsconfig.json

  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "module": "ESNext",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "skipLibCheck": true,

      /* Bundler mode */
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,

      /* Linting */
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,

      /* For vanjs-jsx */
      "jsx": "react-jsx",
      "jsxImportSource": "vanjs-jsx"
    },
    "include": ["src"]
  }
  ```

### Add You Component

1.  main.ts -> main.tsx

    ```tsx
    import van from "vanjs-core";

    import Hello from "./Hello";

    van.add(document.getElementById("app")!, <Hello name={"your name"} />);
    ```

2.  change index.html

    ```html
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>vanjs-jsx</title>
      </head>
      <body>
        <div id="app"></div>
        <!-- change script src -->
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>
    ```

3.  Write Your Component

    Hello.tsx

    ```tsx
    interface IProps {
      name: string;
    }

    const Hello = (props: IProps) => {
      const { name } = props;
      return <div>Hello {name}</div>;
    };

    export default Hello;
    ```
