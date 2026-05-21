# BDX Website Backend

This is the backend for the BDX website, built with Node.js, Express, and Firebase.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Firestore
   - Go to Project Settings > Service Accounts
   - Generate a new private key and download the JSON file
   - Copy the values from the JSON file to the `.env` file

3. Update the `.env` file with your Firebase service account details.

4. Start the server:
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

## API Endpoints

### Teams

- `GET /teams?page=1&limit=10` - Fetch teams with pagination
- `POST /teams` - Create a new team (requires name, region, optional logo)
- `PUT /teams/:id` - Update a team
- `DELETE /teams/:id` - Delete a team

## Validation

POST and PUT requests for teams are validated:
- `name`: String, 1-100 characters, trimmed and escaped
- `region`: String, 1-50 characters, trimmed and escaped
- `logo`: Optional URL

## Pagination

The GET /teams endpoint supports pagination with query parameters:
- `page`: Page number (default 1)
- `limit`: Number of items per page (default 10)