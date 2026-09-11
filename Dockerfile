FROM node:24

WORKDIR /app

COPY .env .
COPY .gitignore .
COPY db.js .
COPY package-lock.json .
COPY package.json .
COPY server.js .
COPY public ./public
COPY routes ./routes
COPY utils ./utils
COPY views ./views

RUN npm install

EXPOSE 3000

CMD ["node" ,"server.js" ]