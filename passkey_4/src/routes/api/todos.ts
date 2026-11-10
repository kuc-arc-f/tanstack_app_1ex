import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/todos')({
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

      // POST
      POST: async ({ request }) => {

        const body = await request.json()

        console.log(body.name)

        return Response.json({
          success: true,
          message: 'INSERT OK',
          data: body,
        })
      },

      // PUT
      PUT: async ({ request }) => {

        const body = await request.json()

        return Response.json({
          success: true,
          message: 'UPDATE OK',
          data: body,
        })
      },

      // DELETE
      DELETE: async ({ request }) => {

        const body = await request.json()

        return Response.json({
          success: true,
          message: 'DELETE OK',
          data: body,
        })
      },

    },
  },
})