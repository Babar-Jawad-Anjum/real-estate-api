# Use official Node.js runtime as a base images
FROM node:16-alpine

# Set Working directory in the conainer
WORKDIR /app

# Copy Package.json & Package-lock.json
COPY package*.json ./

# Install dependencies 
RUN npm install

# Copy the rest of the app source code
COPY . . 

# Generate prisma client
RUN npx prisma generate

# Expose port that react use
EXPOSE 8800

# Run the app
CMD ["node", "app.js"]
