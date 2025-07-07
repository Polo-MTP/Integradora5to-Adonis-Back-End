import { middleware } from './kernel.js'

const authController = () => import('../app/controllers/auth_controller.js')

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  router.post('/register', [authController, 'register'])
  router.post('/login', [authController, 'login'])
}).prefix('/auth')




