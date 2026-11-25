import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/test')({
  server: {
    handlers: {

      // GET
      GET: async () => {
        const db_path = process.env.DB_PATH
console.log("db_path=", db_path)

        const users = [
          { id: 1, name: 'Taro' },
          { id: 2, name: 'Hanako' },
        ]

        return Response.json({
          success: true,
          data: users,
        })
      },
    },
  },
})