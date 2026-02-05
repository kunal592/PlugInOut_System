# PlugInOut System: Startup Guide

Welcome to the PlugInOut System! This guide will walk you through setting up and running the platform for local development.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 10.0.0 or higher
- **Docker** and **Docker Compose**

## 2. Setup

### 2.1. Clone the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone https://github.com/your-username/pluginout-system.git
cd pluginout-system
```

### 2.2. Install Dependencies

Install all the necessary dependencies for the monorepo using npm:

```bash
npm install
```

This command will install dependencies for the core platform and all the tools in the `tools/` directory.

### 2.3. Configure Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and review the variables. For local development, the default values are usually sufficient.

### 2.4. Set Up the Database and Redis

The project uses Docker to run a PostgreSQL database and a Redis instance. To start these services, run:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This command will start the containers in detached mode.

### 2.5. Run Database Migrations and Seeding

Once the database is running, you need to apply the database schema and seed it with initial data:

```bash
npm run db:migrate
npm run db:seed
```

### 2.6. Generate Prisma Clients for Tools

Each tool in the `tools/` directory has its own Prisma client that needs to be generated. You can do this by running the `prisma generate` command in each tool's backend directory.

Here's an example for the `invoice` tool:

```bash
cd tools/invoice/backend && npx prisma generate && cd ../../..
```

You'll need to do this for all 8 tools. We recommend creating a script to automate this process.

## 3. Running the Platform

After completing the setup steps, you can start the development server:

```bash
npm run dev
```

This will start the core backend and frontend, as well as any other services defined in the `turbo.json` file.

## 4. Project Structure

The PlugInOut System is a monorepo with the following structure:

- `apps/`: Contains the core applications (backend and web).
- `tools/`: Contains the individual business tools (plugins).
- `packages/`: Contains shared packages used across the monorepo (e.g., UI components, configs).
- `docs/`: Contains documentation for the project.

## 5. Architecture

- **Core Platform**: Handles authentication, billing, and user management.
- **Tools**: Self-contained plugins with their own domain logic and database tables.
- **Isolation**: Tools never directly access core tables, and the core platform never directly imports tool-specific code.

For a more in-depth look at the architecture, please refer to the `docs/architecture.md` file.

## 6. Troubleshooting

- **"Port already in use" error**: Make sure you don't have any other services running on the ports defined in your `.env` file or `docker-compose.dev.yml`.
- **Database connection errors**: Ensure that the Docker containers for PostgreSQL are running and that the `DATABASE_URL` in your `.env` file is correct.

---

This startup guide should provide you with everything you need to get the PlugInOut System up and running. If you encounter any issues, please refer to the project's documentation or reach out to the development team.
