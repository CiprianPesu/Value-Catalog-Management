# build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# runtime stage
FROM nginx:alpine

# copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# copy config template
COPY public/config.js /usr/share/nginx/html/config.js

# copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]