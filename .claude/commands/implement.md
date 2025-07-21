# Implementation Command

Generate code following established project patterns. Supports Vue 3 components, Nuxt 3 APIs, composables, and services.

## Core Patterns

### **Vue 3 Component**
- `<script setup>` with TypeScript interfaces
- `data-testid` attributes for testing
- shadcn-vue components + Tailwind CSS
- Readonly state exposure from composables
- Proper error/loading states

### **Nuxt 3 API Endpoint**  
- Zod validation schemas
- `defineEventHandler` with proper error handling
- Drizzle ORM database operations
- `createError` for consistent error responses

### **Composable**
- Readonly state exposure pattern
- Async actions with proper error handling  
- Vue 3 reactivity (ref/reactive/computed)
- Return public interface only

### **Service Class**
- Static methods for business logic
- Input validation and error handling
- TypeScript types throughout

## File Organization
- Components: `components/[Feature]/ComponentName.vue`
- Composables: `composables/useFeatureName.ts` 
- Services: `services/serviceName.ts`
- APIs: `server/api/[resource]/[action].[method].ts`

## Integration Requirements
- Use existing Drizzle schema definitions
- Integrate with `useAuth` for protected features  
- Follow shadcn-vue component patterns
- Include `data-testid` for all interactive elements