import { middleware } from './kernel.js'

const authController = () => import('../app/controllers/auth_controller.js')
const TanksController = () => import('../app/controllers/tanks_controller.js')
const RaspberriesController = () => import('../app/controllers/raspberries_controller.js')
const AdminController = () => import('../app/controllers/admin_controller.js')

import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('/register', [authController, 'register'])
    router.post('/login', [authController, 'login'])
  })
  .prefix('/auth')

router
  .group(() => {
    router.post('/register', [authController, 'registerAdmin']).use(middleware.onlyAdmin())
    router.get('/me', [authController, 'CheckAdmin']).use(middleware.onlyAdmin())
    router.get('/index', [AdminController, 'index']).use(middleware.onlyAdmin())
  })
  .prefix('/admin')
  .use(middleware.auth())

router
  .group(() => {
    router.post('/logout', [authController, 'logout'])
    router.get('/me', [authController, 'me'])
    router.patch('/user', [authController, 'update'])
    router.put('/profile-image', [authController, 'updateProfileImage'])
    router.get('validate', [authController, 'validateToken'])
  })
  .use(middleware.auth())
  .prefix('/auth')

router
  .group(() => {
    router.get('me', [authController, 'checkClient'])
  })
  .use(middleware.auth())
  .prefix('/client')

router
  .group(() => {
    router.get('/tanks', [TanksController, 'index'])
    router.post('/tanks', [TanksController, 'create'])
    router.get('/tanks/:id/data', [TanksController, 'show'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.post('/sensor-types', [AdminController, 'createSensorType'])
  })
  .use(middleware.auth())

router.get('/sensor-types', [AdminController, 'indexSensorTypes'])
router.post('/getdevices', [RaspberriesController, 'index'])

router
  .group(() => {
    router.get('/lastdate', [RaspberriesController, 'lastdate'])
    router.get('/last-by-sensor', [RaspberriesController, 'lastBySensor'])
  })
  .use(middleware.auth())
  .prefix('/raspberry')

router.post('/getconfig', [RaspberriesController, 'indexConfig'])
