import { middleware } from './kernel.js'

const authController = () => import('../app/controllers/auth_controller.js')
const TanksController = () => import('../app/controllers/tanks_controller.js')
const RaspberriesController = () => import('../app/controllers/raspberries_controller.js')
const AdminController = () => import('../app/controllers/admin_controller.js')
const SensorController = () => import('../app/controllers/sensor_controller.js')

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


  
router.group(() => {
    router.post('/register', [authController, 'registerAdmin']).use(middleware.onlyAdmin())
}).prefix('/admin').use(middleware.auth())



router.group(() => {
    router.post('/logout', [authController, 'logout'])
    router.get('/me', [authController, 'me'])
    router.patch('/user', [authController, 'update'])
    router.put('/profile-image', [authController, 'updateProfileImage'])
}).use(middleware.auth()).prefix('/auth')



router.group(() => {
    router.get('/tanks', [TanksController, 'index'])
    router.post('/tanks', [TanksController, 'create'])
    router.get('/devices-data', [TanksController, 'getDevicesData'])
}).use(middleware.auth())

router.group(() => {
  router.post('/sensorTypes', [AdminController, 'createSensorType'])
}).use(middleware.auth())

router.get('/sensor-types', [AdminController, 'indexSensorTypes'])


router.post('/getdevices', [RaspberriesController, 'index'])


router.group(() => {
  router.get('/lastdate', [RaspberriesController, 'lastdate'])
  router.get('/last-by-sensor', [RaspberriesController, 'lastBySensor'])
}).use(middleware.auth()).prefix('/raspberry')

// Rutas para el sistema de sensores en tiempo real (API para Python)
router.group(() => {
  router.post('/sensor-data', [SensorController, 'storeSensorData'])
  router.post('/sensor-data/batch', [SensorController, 'storeBatchSensorData'])
  router.get('/socket/stats', [SensorController, 'getSocketStats'])
}).prefix('/api')
