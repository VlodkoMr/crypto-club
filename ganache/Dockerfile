FROM node:alpine

# Set the /app directory as working directory
WORKDIR /app

# Install ganache-cli globally
RUN npm install -g ganache-cli

EXPOSE 8545

# Set the default command for the image
CMD ["ganache-cli", "-h", "0.0.0.0"]
