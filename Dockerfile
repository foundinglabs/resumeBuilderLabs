# 1. Use official Node.js image
FROM node:22-alpine

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy only package.json and package-lock.json first (for caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy all project files into container
COPY . .

# 6. Build your app (for frontend projects)
RUN npm run build

# 7. Expose the port the app listens on
EXPOSE 5000

# 8. Start the app
CMD ["npm", "start"]
