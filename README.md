# 6.1040 Social Media Frontend Starter Code

## Getting Started

If you are using VSCode/VSCodium, install the ESLint and Prettier extensions.
The project is already configured to use ESLint and Prettier,
but feel free to add your own rules if you want.
Right now, the code is formatted on save; you can change this in `.vscode/settings.json`
by disabling `editor.formatOnSave`.

As well, you can install [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) extensions.

Run `npm install` to install dependencies.

## Creating MongoDB Atlas Instance
You should already have created a MongoDB Atlas Instance for the backend implementation.

Copy your `.env` file from your backend code into the root directory of this project. As a reminder:

To run the server, you need to create a MongoDB Atlas instance and connect your project. Feel free to follow the instructions below or use these [slides](https://docs.google.com/presentation/d/1HJ4Lz1a2IH5oKu21fQGYgs8G2irtMqnVI9vWDheGfKM/edit?usp=sharing).
1. Create your [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account.
2. When selecting a template, choose the __free__ option, M0.
4. At the Security Quickstart page, select how you want to authenticate your connection and keep the rest of the defaults. Make sure to allow access to all IPs as shown in [this slide](https://docs.google.com/presentation/d/1HJ4Lz1a2IH5oKu21fQGYgs8G2irtMqnVI9vWDheGfKM/edit#slide=id.g167b96ecbf8_0_0).
5. Once created, click the __CONNECT__ button, select __driver__, and copy the srv connection string. If using username and password, the url should look something like this: `mongodb+srv://<username>:<password>@cluster0.p82ijqd.mongodb.net/?retryWrites=true&w=majority`. Make sure to replace username and password with your actual values.
6. Now go to your project files and create a new file at the root directory called `.env` (don't forget the 'dot' at the front). Add the line (without `<` and `>`)
    ```
    MONGO_SRV=<connection url>
    ```
    to the `.env` file. 

## Running Locally
Using two seperate, dedicated terminals:

Run `npm run dev:server` to start the backend server.
This will automatically restart the server code if you make changes to it.
In active server development, we recommend you run `npm start:server`.

Run `npm run dev:client` to start the client server.
Changes to the client code should automatically recompile and hot-reload without needing to restart the client server.

## Local Development
You should copy over your `concepts/` folder, `app.ts`, `responses.ts`, and `routes.ts` from your backend assignment code into the relevant places in `server/`.

Keep in mind that we are using `MongoStore` for session management,
so your session will be persisted across server restarts.

Under the `client/` directory, you can find the frontend starter code and locate to `http://localhost:5173` (or whatever port the client server shows in your terminal) to see your app.

## Deploying to Vercel

1. Create a new project on Vercel and link it to your GitHub project.
2. Under "Build & Development Settings", change "Framework Preset" to `Vue.js` and "Build Command" to `npm run build`.
3. Add the following environment variables to your Vercel project:
Key: `MONGO_SRV`, Value: `<your mongo connection string from .env file>`
Note: only paste the right hand value after `=` (without `<` and `>`), i.e. `MONGO_SRV=<your mongo connection string>`
4. Deploy!
5. After deploying, go to `Settings`, then the `Deployment Protection` tab. Change `Vercel Authentication` from `Standard Protection` to `Only Preview Documents`. This will allow us to see your previous deployments when you submit your A5 alpha. 

## Understanding the Structure

The main entry point to the server is `api/index.ts`.
This is how the server is started and how the routes are registered.
We would usually put this file under `server/`,
but Vercel requires the entry point to be under `api/` directory.

### Client Server
The code for the client server is under the `client/` directory, which includes the [Vue 3](https://vuejs.org/guide/introduction.html) reactive framework, Single Page Application (SPA) Routing via [Vue Router](https://router.vuejs.org/introduction.html), and persistent store and state management via [Pinia](https://pinia.vuejs.org/introduction.html).

Here's an overview of the files and directories:
- `client/assets` contains `main.css` for defining styles that are applied globally to your app and `images/` to store any image files used. 
- `client/components` contains reusable Vue components used throughout your app to build and compose different parts of the UI.
- `client/router` contains `index.ts` which enables client-side routing by defining and managing the navigation of your app by mapping URLs to different components. Includes navigation guards that allow you to control access to routes and execute code before or after route changes.
- `client/stores` contains individual store modules for storage and state management for specific aspects of your app.
- `client/utils` contains useful utility functions that can be called throughout your app. For example, `fetchy` is a wrapper function around the native Fetch API call that handles errors and alerts the messages to the user.
- `client/views` contains various top-level components that represent the different views or pages of your app. The views are commonly used in conjunction with Vue Router to map specific routes to these view components and render them when the corresponding route is visited.
- `client/App.vue` contains the app-level component whose properties are maintained throughout the app.
- `client/main.ts` contains the main configuration of the app. You should not edit this file.

### Backend Server
The code for the backend server is under `server/` directory,
which includes both concept and RESTful API implementations.

Here's an overview of the files and directories.
First, concept implementations:
- `server/concepts` contains the concept implementations.
Note that we try to keep concepts as modular and generic as possible.
- `server/concepts/errors.ts` contains the base error classes you can
either directly use or extend from. You are free to add more base errors
in that file if you need to
(e.g., if your route needs to return [I am a teapot](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418) error).

Framework code:

- `framework/router.ts` contains the framework code that does the magic to convert your
route implementations and error handling into Express handlers.
Editing this file is not recommended.
- `framework/doc.ts` defines a convenient wrapper around MongoDB. You may want to edit this file.

Server implementation:

- `server/app.ts` contains your app definition (i.e., concept instantiations).
- `server/db.ts` contains the MongoDB setup code. You should not need to edit this file.
- `server/routes.ts` contains the code for your API routes.
Try to keep your route definitions as simple as possible.
- `server/responses.ts` contains the code for formatting your responses and errors
into a more user-friendly format for the front-end. For example, it would be better
if your front-end receives `barish is not the author of this post` instead of
`64e52a1f5ffc7d0d48a0569d is not the author of this post`.

And tests:

- `test` contains Mocha unit tests for the server.
