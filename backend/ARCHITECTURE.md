# Backend Architecture

This backend uses a structured approach similar to Mongoose but adapted for Supabase.

## Directory Structure

```
backend/
├── schemas/          # Data schemas (like Mongoose schemas)
├── models/           # Database operations
├── controllers/      # HTTP request handlers
├── routes/           # API route definitions
├── utils/            # Utility functions
└── config/           # Configuration files
```

## Schemas

Schemas define the structure and validation rules for each entity:

- `teamSchema.js` - Team data structure
- `tournamentSchema.js` - Tournament data structure
- `registrationSchema.js` - Registration data structure

Each schema includes:
- Field types (varchar, uuid, timestamp, etc.)
- Validation rules (required, length, etc.)
- Default values
- References to other tables

## Models

Models contain database operations and reference their schemas:

- `Team` - CRUD operations for teams
- `Tournament` - CRUD operations for tournaments
- `Registration` - CRUD operations for registrations

## Controllers

Controllers handle HTTP requests and use validation:

- Validate incoming data against schemas
- Call appropriate model methods
- Return responses

## Validation

Custom validation utility (`utils/validation.js`) validates data against schemas before database operations, similar to Mongoose validation.

## API Endpoints

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `GET /api/teams/creator/:creatorId` - Get teams by creator
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/upcoming` - Get upcoming tournaments
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments` - Create tournament
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament

### Registrations
- `GET /api/registrations` - Get all registrations
- `GET /api/registrations/:id` - Get registration by ID
- `GET /api/registrations/tournament/:tournamentId` - Get registrations by tournament
- `GET /api/registrations/team/:teamId` - Get registrations by team
- `POST /api/registrations` - Create registration
- `PUT /api/registrations/:id` - Update registration
- `DELETE /api/registrations/:id` - Delete registration

## Why Not Mongoose?

Mongoose is designed for MongoDB, but this project uses Supabase (PostgreSQL). While you could use MongoDB with Mongoose, Supabase provides better real-time features, authentication, and PostgreSQL's relational capabilities.