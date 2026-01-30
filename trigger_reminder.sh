#!/bin/bash
# Script to trigger the 10 PM reminder broadcast

# You need to run this from the frontend directory
# And make sure SUPABASE_SERVICE_ROLE_KEY is set in your environment or .env.local

curl -X POST http://localhost:3000/api/push \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Expensy Reminder",
    "body": "Don'"'"'t forget to log your expenses for today!",
    "url": "/"
  }'
