FROM node:12
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 8080
EXPOSE 1234
CMD ["npm","start"]
