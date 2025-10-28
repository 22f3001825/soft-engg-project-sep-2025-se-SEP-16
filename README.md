# Intellica

Intellica is a comprehensive customer service platform built with React, featuring role-based authentication and advanced customer support functionality. It provides a unified interface for customers, agents, supervisors, and vendors to manage orders, tickets, and support operations.

## Features

- **Multi-role Authentication**: Customer, Agent, Supervisor, and Vendor roles
- **Customer Dashboard**: View orders, submit tickets, track shipments
- **Agent Portal**: Manage customer tickets and support requests
- **Supervisor Portal**: Oversee operations and team performance
- **Vendor Portal**: Manage products and inventory
- **Responsive Design**: Built with Tailwind CSS and Radix UI components

## How to Run Intellica

Intellica can be run in multiple ways depending on your development environment and deployment needs.

### Method 1: Local Development with Yarn

#### Prerequisites
- Node.js 18+
- Yarn package manager

#### Setup and Run
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Start development server
yarn start
```

The application will be available at `http://localhost:3000`

#### Available Scripts
```bash
# Start development server
yarn start

# Build for production
yarn build

# Run tests
yarn test

# Eject from Create React App (not recommended)
yarn eject
```

### Method 2: Docker Compose (Recommended for Production)

#### Prerequisites
- Docker
- Docker Compose

#### Setup and Run
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

The application will be available at `http://localhost:3000`

### Method 3: Manual Docker Build

#### Prerequisites
- Docker

#### Setup and Run
```bash
# Build the Docker image
docker build -t intellica .

# Run the container
docker run -p 3000:80 intellica
```

### Method 4: Production Build with Nginx

#### Build for Production
```bash
cd frontend
yarn build
```

The built files will be in `frontend/build/` directory. Serve these files with any web server (Nginx, Apache, etc.).

#### Example Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Login Credentials

- **Customer**: `customer@intellica.com` / `customer123`
- **Agent**: `agent@intellica.com` / `agent123`
- **Supervisor**: `supervisor@intellica.com` / `supervisor123`
- **Vendor**: `vendor@intellica.com` / `vendor123`



## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── ui/
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   └── pages/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── package.json
```

## Technologies Used

- **Frontend**: React 19, React Router, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Forms**: React Hook Form, Zod validation
- **Deployment**: Docker, Nginx
- **Development**: Create React App, CRACO

## Environment Variables

The application uses mock data and doesn't require backend services. All authentication and data is handled client-side with local storage.

## License

This project is for educational purposes.
