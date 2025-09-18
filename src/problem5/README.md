# Problem 5: User Management API

ExpressJS + TypeScript CRUD API with SQLite database and Prisma ORM.

## What it does

- Full CRUD operations for user management
- Search/filter users with pagination
- Input validation with Zod
- Centralized error handling
- Security measures to prevent unauthorized operations

## Features

- User creation, reading, updating, deletion
- Name search and score filtering
- Pagination and sorting capabilities
- Type-safe database operations
- Email uniqueness validation
- Sanitized error responses

## Tech Stack

- Express.js + TypeScript
- Prisma ORM
- SQLite database
- Zod validation

## Setup & Testing

```bash
# Install and setup
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Server runs at http://localhost:3000

## API Endpoints

```
POST   /users           # create user
GET    /users           # list users (with filters)
GET    /users/:id       # get user details
PUT    /users/:id       # update user
DELETE /users/:id       # delete user
GET    /health          # health check
```

## Test Commands

```bash
# 1. Create users
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "Alice Smith", "email": "alice@example.com"}'
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "Bob Johnson", "email": "bob@example.com"}'

# 2. List all users
curl http://localhost:3000/users

# 3. Filter by name
curl "http://localhost:3000/users?name=alice"

# 4. Get user by ID (replace {id} with actual ID)
curl http://localhost:3000/users/{id}

# 5. Update user
curl -X PUT http://localhost:3000/users/{id} -H "Content-Type: application/json" -d '{"name": "Alice Johnson"}'

# 6. Delete user
curl -X DELETE http://localhost:3000/users/{id}

# 7. Test validation errors
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "Test", "email": "invalid-email"}'
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "Test", "email": "bob@example.com"}'
```

## Expected Results

- ✅ Users created (201 status)
- ✅ List return paginated results
- ✅ Filtering work with partial matches
- ✅ Updates modify specified fields
- ✅ Deletions return 204 status
- ✅ Invalid email return 400 error
- ✅ Duplicate email return 409 error
