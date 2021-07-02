FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY Relay-IVR-2.js .

EXPOSE 3000

CMD ["npm","start"]