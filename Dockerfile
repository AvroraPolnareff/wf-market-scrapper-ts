FROM node:19-alpine3.16
WORKDIR /app/

COPY package*.json ./
RUN npm i
COPY . .
ENTRYPOINT ["npm", "start"]
