import { middleware } from './kernel.js'

const authController = () => import('../app/controllers/auth_controller.js')
const TanksController = () => import('../app/controllers/tanks_controller.js')

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    router.post('/register', [authController, 'register'])
    router.post('/login', [authController, 'login'])
  })
  .prefix('/auth')

router
  .group(() => {
    router.post('/logout', [authController, 'logout'])
    router.get('/me', [authController, 'me'])
  })
  .use(middleware.auth())
  


router.group(() => {
  router.get('/tanks', [TanksController, 'index'])
  router.post('/tanks', [TanksController, 'create'])
}).use(middleware.auth())