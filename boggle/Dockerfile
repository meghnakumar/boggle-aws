FROM node:16.15.1

WORKDIR /app

# frontend build starts

COPY ["package.json", "package-lock.json*", "../"]

RUN npm install

COPY . .
RUN npm run build

#RUN rm -rf public src node_modules
#
#RUN rm package.json package-lock.json

# frontend build end

EXPOSE 3001

CMD ["npm", "start"]