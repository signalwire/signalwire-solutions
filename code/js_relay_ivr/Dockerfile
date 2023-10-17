FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY index.js .

EXPOSE 3000

CMD ["npm","start"]