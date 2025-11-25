# Routes/appRoute.js API Documentation

This file contains the main API routes for a movie management system, providing endpoints for movie operations, reviews, categories, ticket pricing, and status management.

## Movie Routes

### GET /movies
**Line:** 7  
**Purpose:** Retrieves all movies from the database  
**Parameters:** None  
**Return Type:** JSON array of movie objects  
**Usage Example:**
```http
GET /movies
```

### POST /movies
**Line:** 8  
**Purpose:** Creates a new movie entry  
**Parameters:** Movie data in request body  
**Return Type:** Created movie object  
**Usage Example:**
```http
POST /movies
Content-Type: application/json

{
  "title": "Movie Title",
  "category": "Action",
  "description": "Movie description"
}
```

### GET /moviesById/:movieId
**Line:** 9  
**Purpose:** Retrieves a specific movie by its ID  
**Parameters:**
- `movieId` (path parameter) - Unique identifier of the movie  
**Return Type:** Movie object  
**Usage Example:**
```http
GET /moviesById/123
```

### GET /movieByName/:title
**Line:** 10  
**Purpose:** Retrieves a movie by its title  
**Parameters:**
- `title` (path parameter) - Title of the movie  
**Return Type:** Movie object  
**Usage Example:**
```http
GET /movieByName/Inception
```

### GET /movieByCategory/:category
**Line:** 11  
**Purpose:** Retrieves all movies belonging to a specific category  
**Parameters:**
- `category` (path parameter) - Movie category/genre  
**Return Type:** JSON array of movie objects  
**Usage Example:**
```http
GET /movieByCategory/Action
```

### DELETE /movies/:id
**Line:** 16  
**Purpose:** Deletes a movie by its ID  
**Parameters:**
- `id` (path parameter) - Unique identifier of the movie to delete  
**Return Type:** Confirmation message  
**Usage Example:**
```http
DELETE /movies/123
```

### PUT /movie/:id
**Line:** 17  
**Purpose:** Updates an existing movie by its ID  
**Parameters:**
- `id` (path parameter) - Unique identifier of the movie to update
- Updated movie data in request body  
**Return Type:** Updated movie object  
**Usage Example:**
```http
PUT /movie/123
Content-Type: application/json

{
  "title": "Updated Title",
  "category": "Drama"
}
```

### GET /moviesByQuery
**Line:** 24  
**Purpose:** Searches movies based on query parameters  
**Parameters:** Query parameters in URL  
**Return Type:** JSON array of matching movie objects  
**Usage Example:**
```http
GET /moviesByQuery?genre=Action&year=2023
```

## Review Routes

### POST /reviews
**Line:** 12  
**Purpose:** Creates a new movie review  
**Parameters:** Review data in request body  
**Return Type:** Created review object  
**Usage Example:**
```http
POST /reviews
Content-Type: application/json

{
  "movieId": "123",
  "rating": 5,
  "comment": "Great movie!"
}
```

### GET /reviews/:movieId
**Line:** 13  
**Purpose:** Retrieves all reviews for a specific movie  
**Parameters:**
- `movieId` (path parameter) - ID of the movie  
**Return Type:** JSON array of review objects  
**Usage Example:**
```http
GET /reviews/123
```

## Category Routes

### POST /movies/categories
**Line:** 14  
**Purpose:** Creates a new movie category  
**Parameters:** Category data in request body  
**Return Type:** Created category object  
**Usage Example:**
```http
POST /movies/categories
Content-Type: application/json

{
  "name": "Sci-Fi",
  "description": "Science Fiction movies"
}
```

### GET /movies/categories
**Line:** 15  
**Purpose:** Retrieves all movie categories  
**Parameters:** None  
**Return Type:** JSON array of category objects  
**Usage Example:**
```http
GET /movies/categories
```

## Ticket Price Routes

### GET /ticket-prices
**Line:** 18  
**Purpose:** Retrieves all ticket prices  
**Parameters:** None  
**Return Type:** JSON array of ticket price objects  
**Usage Example:**
```http
GET /ticket-prices
```

### POST /ticket-prices
**Line:** 19  
**Purpose:** Creates a new ticket price entry  
**Parameters:** Ticket price data in request body  
**Return Type:** Created ticket price object  
**Usage Example:**
```http
POST /ticket-prices
Content-Type: application/json

{
  "type": "adult",
  "price": 12.99
}
```

### PUT /ticket-prices/:type
**Line:** 20  
**Purpose:** Updates ticket price for a specific type  
**Parameters:**
- `type` (path parameter) - Type of ticket (e.g., adult, child, senior)
- Updated price data in request body  
**Return Type:** Updated ticket price object  
**Usage Example:**
```http
PUT /ticket-prices/adult
Content-Type: application/json

{
  "price": 14.99
}
```

### GET /ticket-prices/:type
**Line:** 21  
**Purpose:** Retrieves ticket price for a specific type  
**Parameters:**
- `type` (path parameter) - Type of ticket  
**Return Type:** Ticket price object  
**Usage Example:**
```http
GET /ticket-prices/adult
```

## Status Management Routes

### PUT /update-status
**Line:** 22  
**Purpose:** Updates the status of multiple movies  
**Parameters:** Status update data in request body  
**Return Type:** Update confirmation  
**Usage Example:**
```http
PUT /update-status
Content-Type: application/json

{
  "status": "active",
  "movieIds": ["123", "456"]
}
```

### PUT /update-statusById/:movieId
**Line:** 23  
**Purpose:** Updates the status of a specific movie by its ID  
**Parameters:**
- `movieId` (path parameter) - ID of the movie
- Status data in request body  
**Return Type:** Updated movie object  
**Usage Example:**
```http
PUT /update-statusById/123
Content-Type: application/json

{
  "status": "inactive"
}
```