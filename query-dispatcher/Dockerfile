FROM node:latest

# Create a folder to add the code to
WORKDIR /app

# Copy in package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the code into the container
COPY . .

# Set the server to hot reload on code changes
CMD npm run prod
