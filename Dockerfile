# Base image
FROM node:19

# Create app directory
WORKDIR /usr/src/app
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY --chown=node:node ./patches ./patches
COPY --chown=node:node package*.json yarn.lock ./

# Install app dependencies
RUN yarn install --frozen-lockfile --unsafe-perm

# Bundle app source
COPY --chown=node:node . .

# Creates a "dist" folder with the production build
RUN yarn run build

USER node
# Start the server using the production build
CMD [ "node", "dist/main.js" ]