# Deployment


#### https://cookbook-social.herokuapp.com/


## Heroku Deployment Dashboard for Team Member Reference:

https://dashboard.heroku.com/apps/cookbook-social

## Deployment Info:

- Using your .edu email, get the Github Student Developer Pack at https://education.github.com/pack
- After receiving the Github Student Developer pack, use it to receive free Heroku Dinos at https://www.heroku.com/github-students (requires credit card, but it will not charge you).
- Upload the website to a Github Repo.
- Since this is a full stack app, there needs to be a package.json on the top most level of the github directory to tell Heroku what it needs to do to run the app.

### Package.json:
```json
{
  "name": "cookbooksocial",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "start": "cd CookBookSocial && cd backend && npm install && node index.js",
    "heroku-postbuild": "cd CookBookSocial && cd frontend && npm install && npm run build"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "firebase": "^9.17.1",
    "react-infinite-scroll-component": "^6.1.0",
    "react-router-dom": "^6.8.2",
    "source-map-loader": "^4.0.1"
  }
}
```

- The backend is using express.js, so to tell Heroku to start the backend, create the "start" script as is above.
- The frontend is using React.  In order to serve the React app on the same server that the backend is on, there must be a "heroku-postbuild" script to build the frontend app.
- Then, there must be code implemented in the backend that redirects the user to the React frontend unless the user goes to route /api (which is why it is important to have all routes in the backend be prefixed with the /api route.
- Finally, the app is ready to be deployed on Heroku.  On Heroku, create a new app, connect the Github Repo, then deploy the Github Repo through Heroku.

For more detials, visit https://daveceddia.com/deploy-react-express-app-heroku/.
