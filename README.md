# Crypto Club

### Requirements

- NodeJS
- Docker

### Install

```
cd ./client/ && npm i && cd ../server/ && npm i
docker-compose build
```

### Run development

```
docker-compose up
```

- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend: [http://localhost:9000](http://localhost:9000)

#### Migration & Seed

```
docker-compose exec server npx prisma migrate dev
docker-compose exec server npx prisma db seed --preview-feature
```

#### Introspect DB
docker-compose exec server npx prisma introspect --force

#### Truffle
cd client/src/blockchain
truffle