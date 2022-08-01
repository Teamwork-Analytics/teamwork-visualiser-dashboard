FROM node:16-slim

WORKDIR /usr/src/app

COPY package*.json ./

# uncomment next line to disable logging
ENV NODE_ENV production

RUN npm ci

COPY . .

EXPOSE 5001

USER node

CMD ["npm", "start"]