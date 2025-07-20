# Create API Endpoint

Create a Nuxt 3 API endpoint with proper error handling and database operations.

## Requirements

1. **File structure**: Place in `server/api/` directory
   - GET: `server/api/resource.get.ts`
   - POST: `server/api/resource.post.ts`
   - Dynamic: `server/api/resource/[id].get.ts`

2. **Use defineEventHandler**:
   ```typescript
   export default defineEventHandler(async (event) => {
     try {
       // Implementation
     } catch (error) {
       throw createError({
         statusCode: 400,
         statusMessage: 'Descriptive error message'
       })
     }
   })
   ```

3. **Input validation**:
   ```typescript
   // For POST/PUT requests
   const body = await readBody(event)
   
   // Validate required fields
   if (!body.title || !body.durationMs) {
     throw createError({
       statusCode: 400,
       statusMessage: 'Missing required fields: title, durationMs'
     })
   }
   ```

4. **Database operations with Drizzle ORM**:
   ```typescript
   import { db } from '~/server/database'
   import { activities } from '~/server/database/schema'
   
   // Create
   const result = await db.insert(activities).values(data).returning()
   
   // Read
   const results = await db.select().from(activities).where(eq(activities.id, id))
   
   // Update
   const updated = await db.update(activities).set(data).where(eq(activities.id, id)).returning()
   
   // Delete
   await db.delete(activities).where(eq(activities.id, id))
   ```

5. **Response format**:
   ```typescript
   // Success response
   return {
     data: result,
     message: 'Success message (optional)'
   }
   
   // For lists
   return {
     data: results,
     total: results.length,
     page: 1 // if paginated
   }
   ```

6. **Error handling patterns**:
   - 400: Bad Request (validation errors)
   - 404: Not Found (resource doesn't exist)
   - 500: Internal Server Error (database/system errors)

7. **TypeScript types**:
   - Import types from `~/types/`
   - Use proper return type annotations
   - Validate types at runtime for external inputs

8. **Security considerations**:
   - Validate all inputs
   - Use parameterized queries (Drizzle handles this)
   - Don't expose sensitive data
   - Consider authentication/authorization if needed

9. **Reference existing endpoints**:
   - `server/api/activities/`
   - `server/api/ai/daily-summary.post.ts`