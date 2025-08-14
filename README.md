# EL App Backend

A scalable backend API for an English learning application, built with [NestJS](https://nestjs.com/) and TypeScript. This project provides user management, authentication, learning content, notes, milestones, todos, and more, with MongoDB and Redis integration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Modules](#modules)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Resources](#resources)

---

## Overview

EL App Backend is designed to support an English learning platform, providing RESTful APIs for user management, content delivery, progress tracking, and more. It leverages NestJS for modularity and scalability, MongoDB for data storage, and Redis for caching and session management.

---

## Features

- **User Authentication**: JWT-based login, registration, and session management.
- **Learning Content**: CRUD APIs for chapters, units, lessons.
- **Notes**: User notes management.
- **Milestones**: Track learning progress.
- **Todos**: Personal task management.
- **Slug Counter**: Unique slug generation for resources.
- **Mail Service**: Email notifications using Handlebars templates.
- **Redis Integration**: For caching and session management.
- **MongoDB Integration**: Data persistence.
- **Validation & Interceptors**: Global validation and response transformation.
- **Environment-based Configuration**: Easily switch between development and production.

---

## Architecture

- **NestJS**: Modular, dependency-injected structure.
- **MongoDB**: Main database, accessed via Mongoose.
- **Redis**: Used for caching and session storage.
- **Mailer**: Sends emails using SMTP and Handlebars templates.
- **Passport**: Authentication strategies (JWT, Local).
- **Global Pipes & Interceptors**: Validation and response formatting.

---

## Folder Structure

```
src/
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts
  common/
    enums.ts
    decorator/
    dto/
    helpers/
    templates/
  core/
    interceptors/
    redis/
  modules/
    auth/
    learning-contents/
    milestones/
    notes/
    slug-counter/
    todos/
    users/
test/
  app.e2e-spec.ts
  user.e2e-spec.ts
```

---

## Modules

- **Auth**: Handles authentication, JWT, and user sessions.
- **Users**: User CRUD and profile management.
- **Learning Contents**: Chapters, units, lessons APIs.
- **Notes**: User notes CRUD.
- **Milestones**: Progress tracking.
- **Todos**: Personal todo list.
- **Slug Counter**: Ensures unique slugs for resources.
- **Core/Redis**: Redis connection and utilities.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) package manager
- [MongoDB](https://www.mongodb.com/) instance
- [Redis](https://redis.io/) instance

---

## Project Setup

```bash
pnpm install
```

---

## Environment Variables

Create a `.env` file in the root directory. Example:

```env
PORT=8080
MONGODB_URI='mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority'
JWT_ACCESS_TOKEN_SECRET='<your-secret>'
JWT_ACCESS_TOKEN_EXPIRED='30d'
JWT_REFRESH_TOKEN_EXPIRED='7d'
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=''
MAIL_HOST='smtp.gmail.com'
MAIL_SECURE='true'
MAIL_PORT=465
MAIL_USER='<your-email>'
MAIL_PASSWORD='<your-password>'
MAIL_DEFAULT_FROM='"No Reply" <no-reply@example.com>'
MAIL_TEMPLATE_STRICT='true'
```

---

## Running the Project

```bash
# Development
pnpm run start

# Watch mode
pnpm run start:dev

# Production
pnpm run start:prod
```

---

## Testing

```bash
# Unit tests
pnpm run test

# End-to-end tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

---

## Deployment

See [NestJS deployment docs](https://docs.nestjs.com/deployment) for best practices.

You can deploy to AWS using [NestJS Mau](https://mau.nestjs.com):

```bash
pnpm install -g mau
mau deploy
```

---

## API Documentation

- All endpoints are prefixed with `/api`.
- Authentication required for most endpoints (JWT).
- See individual module controllers for detailed routes (e.g., `/api/users`, `/api/auth`, `/api/learning-contents`, etc.).
- For full API documentation, consider using [Swagger](https://docs.nestjs.com/openapi/introduction) integration.

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/fooBar`).
3. Commit your changes (`git commit -am 'Add some fooBar'`).
4. Push to the branch (`git push origin feature/fooBar`).
5. Create a new Pull Request.

---

## License

This project is currently UNLICENSED. Please contact the author for usage permissions.

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Discord Channel](https://discord.gg/G7Qnnhy)
- [Courses](https://courses.nestjs.com/)
- [Devtools](https://devtools.nestjs.com)
- [Jobs Board](https://jobs.nestjs.com)

---

If you need more detailed API documentation (e.g., endpoint details, request/response examples), let me know!
