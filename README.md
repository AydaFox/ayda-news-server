# Ayda News Server

## Link to the API on Render

Make requests to [Ayda News Server](https://ayda-news-api.onrender.com/api).

Follow the link above to view all the available endpoints of the api.

## About

This is my personal back end project to create and host a news API, similar in functionality to how sites like Reddit work.

## How to Setup and Run Locally

Follow these steps in your terminal:

1. Clone the GitHub repo
   - `git clone https://github.com/AydaFox/ayda-news-server.git`
2. Install all dependencies required for the project to run
   - `npm install`
   - If the devDependencies haven't installed please install them manually, they are necessary for running the project tests:
      - `npm install -D jest` 
      - `npm install -D jest-extended`
      - `npm install -D jest-sorted`
      - `npm install -D supertest`
3. Create 2 files in the root directory for the environment variables
   - **.env.development**
   - **.env.test**
4. Add the database names to the appropriate file
   - to **.env.development** add  `PGDATABASE=nc_news` 
   - to **.env.test** add  `PGDATABASE=nc_news_test` 
5. Create and seed a local database
   - `npm run setup-dbs`
   - `npm run seed`

Please ensure you have installed:
- node v16 or later
- node-pg v8.2 or later

And you should be good to go!
