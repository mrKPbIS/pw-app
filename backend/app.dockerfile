FROM node:18-alpine
WORKDIR /
COPY app/ .
RUN npm i
EXPOSE 3000
CMD ["npm", "run", "start"]
