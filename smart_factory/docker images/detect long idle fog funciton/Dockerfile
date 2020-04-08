# Use the official image as a parent image. This is the default Node.js parent image
FROM node:current-slim

# Set the working directory
WORKDIR /usr/tmp/app

# Run the command inside your image filesystem
RUN npm install

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 12345

# Run the specified command within the container.
CMD [ "npm", "start" ]

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .
