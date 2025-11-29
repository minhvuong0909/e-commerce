import { Router } from 'express'
const router = Router()

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', async (req, res) => {
  res.json([{ id: 1, name: 'John Doe' }])
})

export default router
