# Social Census API
Backend for `https://www.social-census.com/`

## Running
1. Requires `firebasePrivateKey.json` to be included in `/src/firebase`
2. Modify `.env.example` and rename to `.env`
3. To run development build, `docker-compose up --build`
4. Enter the server container with `docker exec -ti server /bin/sh`, and run `npx prisma db push` to create the tables in Postgres.
5. To seed the db with questions, run `npx prisma db seed` with the desired questionBank.csv in the src/prisma/ folder
