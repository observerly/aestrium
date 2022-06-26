# Use the official Node.js latest image.
# https://hub.docker.com/_/node
FROM node:latest
# Create and change to the app directory inside the container.
WORKDIR /usr/src/app

COPY .npmrc ./.npmrc
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

RUN yarn install

# Build
COPY . ./

RUN npm run build
CMD npm run start