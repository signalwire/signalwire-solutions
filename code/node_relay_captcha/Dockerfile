FROM node:alpine

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY index.js .
COPY config ./config

CMD [ "npm", "start" ]