# (ing) Studios Trusted Tester System
This repository contains the source code for the trusted tester system. Feel free to fork this repository as a base for your own trusted tester system.

## Commands
### Create a new trusted tester code
Create a code for 20 days by running this command:

```
npm run dev create [app name] [app url] [max uses (optional - default 1)]
```

## Development
1. **Clone the repository**

```
git clone https://github.com/ingStudiosOfficial/trustedtester-system.git
```

2. **Clone the ```.env.example``` file**

```
copy .env.example .env a/
```

3. **Setup environmental variables**

```.env
MONGODB_CONNECTION_STRING= # MongoDB connection string
DB_NAME= # Database name
PORT= # Local development port
SERVER_URL= # URL of your server (e.g. http://localhost:3000 if your local port is 3000)
TRUSTED_SECRET= # Random hash - use this in your other applications for the trusted tester program
```