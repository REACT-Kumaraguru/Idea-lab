# Problem Statements Database Schema

This directory contains the MySQL schema for the Problem Statements feature.

## Tables Created

### 1. `problem_statements`
Main table storing all problem statement submissions with all form fields organized by sections (A-H).

**Key Fields:**
- `id`: Primary key
- `user_id`: Foreign key to `users` table
- `status`: Submission status (pending, approved, rejected, draft)
- `admin_notes`: Notes from admin reviewer
- `reviewed_by`: Admin who reviewed the submission
- `reviewed_at`: Timestamp of review

**Sections:**
- Section A: Basic Organisation Details (Public + Confidential)
- Section B: Problem Statement Overview (Public + Confidential)
- Section C: SDG and Thematic Alignment (Public + Confidential)
- Section D: Field Context and Access (Public + Confidential)
- Section E: Data and Resources (Public + Confidential)
- Section F: Expectations from REACT (Public + Confidential)
- Section G: Ethics and Consent (Public + Confidential)
- Section H: Supporting Materials (Public + Confidential)

### 2. `problem_statement_images`
Stores uploaded images associated with problem statements.

**Fields:**
- `id`: Primary key
- `problem_statement_id`: Foreign key to `problem_statements`
- `image_path`: File path on server
- `image_name`: Original filename
- `image_size`: File size in bytes
- `image_type`: MIME type

### 3. `problem_statement_documents`
Stores uploaded documents/reports associated with problem statements.

**Fields:**
- `id`: Primary key
- `problem_statement_id`: Foreign key to `problem_statements`
- `document_path`: File path on server
- `document_name`: Original filename
- `document_size`: File size in bytes
- `document_type`: MIME type

## Installation

### Option 1: Using Sequelize (Recommended)
The Sequelize models will automatically create the tables when you sync the database:

```javascript
// In your database initialization file
import ProblemStatement from './models/ProblemStatementModel.js';
import ProblemStatementImage from './models/ProblemStatementImageModel.js';
import ProblemStatementDocument from './models/ProblemStatementDocumentModel.js';

// Sync models (use { alter: true } for development, { force: true } to drop and recreate)
await ProblemStatement.sync({ alter: true });
await ProblemStatementImage.sync({ alter: true });
await ProblemStatementDocument.sync({ alter: true });
```

### Option 2: Using Raw SQL
Execute the SQL file directly in your MySQL database:

```bash
mysql -u your_username -p your_database < problem_statements_schema.sql
```

Or import via MySQL client:
```sql
SOURCE /path/to/problem_statements_schema.sql;
```

## Indexes

The following indexes are created for better query performance:
- `idx_user_id`: For filtering by user
- `idx_status`: For filtering by status (pending, approved, etc.)
- `idx_organisation_type`: For filtering by organization type
- `idx_geographic_context`: For filtering by geographic context
- `idx_created_at`: For sorting by submission date
- `idx_reviewed_at`: For sorting by review date

## Foreign Keys

- `user_id` → `users(id)` (CASCADE DELETE)
- `reviewed_by` → `admins(id)` (SET NULL ON DELETE)
- `problem_statement_id` (in images/documents tables) → `problem_statements(id)` (CASCADE DELETE)

## Notes

- JSON fields (`relevant_sdgs`, `support_type`) store arrays as JSON
- TEXT fields are used for longer content (descriptions, notes, etc.)
- ENUM fields ensure data consistency for predefined options
- Timestamps (`created_at`, `updated_at`) are automatically managed
- File paths for images and documents should be stored relative to your upload directory

## Usage Example

```javascript
import ProblemStatement from './models/ProblemStatementModel.js';

// Create a new problem statement
const problem = await ProblemStatement.create({
  userId: 1,
  organisationName: "Example NGO",
  organisationType: "NGO",
  // ... other fields
});

// Find all pending submissions
const pending = await ProblemStatement.findAll({
  where: { status: 'pending' },
  include: [{ model: User, as: 'user' }]
});

// Approve a submission
await ProblemStatement.update(
  { 
    status: 'approved',
    reviewedBy: adminId,
    reviewedAt: new Date()
  },
  { where: { id: problemId } }
);
```
