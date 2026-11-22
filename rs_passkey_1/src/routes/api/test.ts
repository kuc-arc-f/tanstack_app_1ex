import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/test')({
  server: {
    handlers: {

      // GET
      GET: async () => {

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