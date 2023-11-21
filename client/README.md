# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# App architecture

This section of the README outlines the architecture of `client` application. The structure is selected to pursue modularity, ease of maintenance, scalability, and readability.

## Project Structure Overview

The project is organized as follows:

```
client/
├── src/
│   ├── App/
│   │   ├── App.tsx
│   │   └── ...
│   ├── features/
│   │   ├── category-a (e.g. login)/
│   │   │   ├── feature-a (e.g. login-authentication)/
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   │   └── utils/
│   │   │   │   └── ...
│   │   │   ├── feature-b (e.g. login-timeout)/
│   │   │   │   └── configs/
│   │   │   │   └── ...
│   │   └── category-b (e.g. tagging)/
│   │       └── ...
│   ├── pages/
│   │   ├── error/
│   │   ├── main/
│   │   └── ...
│   └── shared/
│       ├── constants/
│       ├── data/
│       ├── components/
│       └── utils/
└── ...

```

Explanation:

1. `App`. Root component of the application. Responsible for global application setup, including routing and context providers.
2. `features`. Individual project or business logic, usually page-related. Interaction between features should be minimized and managed through well-defined interfaces and shared services.
3. `shared`. Directory for reusable data shared between features. It may contain UI components, utils, types, and configs.
4. `components`. UI — specific components. They are the components that can be reused in other projects for keeping consistency, but it should not contain business logic.
5. Note: Each feature should be as independent as possible. Commonly used components and utilities should reside in the shared directory. Features should not directly depend on each other. Shared logic or data should be extracted to the shared directory. Avoid importing from parent or neighboring directories to maintain modularity.
