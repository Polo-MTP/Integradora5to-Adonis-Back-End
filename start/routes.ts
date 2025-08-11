import { middleware } from './kernel.js'

const authController = () => import('../app/controllers/auth_controller.js')
const TanksController = () => import('../app/controllers/tanks_controller.js')
const RaspberriesController = () => import('../app/controllers/raspberries_controller.js')
const AdminController = () => import('../app/controllers/admin_controller.js')
const mqttsController = () => import('../app/controllers/mqtts_controller.js')

import router from '@adonisjs/core/services/router'


router.get('/', () => 'Hello world!')



// rutas para login
router.group(() => {
  router.post('/register', [authController, 'register'])
  router.post('/login', [authController, 'login'])
}).prefix('/auth')


// rutas para administradores
router.group(() => {
  router.post('/register', [authController, 'registerAdmin']).use(middleware.onlyAdmin())
  router.get('/me', [authController, 'CheckAdmin']).use(middleware.onlyAdmin())
  router.get('/index', [AdminController, 'indexUsers']).use(middleware.onlyAdmin())
  router.get('/tanks', [AdminController, 'showTanksPendents']).use(middleware.onlyAdmin())
  router.get('/tank/details/:id', [AdminController, 'showTankDetails']).use(middleware.onlyAdmin())
  router.put('/tank/aprove/:id', [AdminController, 'aproveTank']).use(middleware.onlyAdmin())
  router.get('/sensors', [AdminController, 'indexSensors']).use(middleware.onlyAdmin())
  router.put('/sensor/:id', [AdminController, 'updateSensor']).use(middleware.onlyAdmin())
  router.post('/sensor', [AdminController, 'createSensorType'])
}).prefix('/admin').use(middleware.auth())

  
// rutas para auth
router.group(() => {
  router.post('/logout', [authController, 'logout'])
  router.get('/me', [authController, 'me'])
  router.patch('/user', [authController, 'update'])
  router.put('/profile-image', [authController, 'updateProfileImage'])
  router.get('validate', [authController, 'validateToken'])
}).use(middleware.auth()).prefix('/auth')


// rutas para las peceras
router.group(() => {
    router.get('/tanks', [TanksController, 'index'])
    router.post('/tanks', [TanksController, 'create'])
    router.get('/tanks/:id/data', [TanksController, 'show'])
    router.get('/tanks/:id/stadistics', [TanksController, 'stadistics'])
}).use(middleware.auth())



router.group(()=> {
  router.post('/addconfig/:id', [mqttsController, 'addConfig'])
}).use(middleware.auth())


//rutas para mqtt
router.group(()=> {
  router.post('/feed/:id', [mqttsController, 'ServirComida'])
  router.post('/led/:id', [mqttsController, 'encenderLed'])
  router.post('/led/:id/off', [mqttsController, 'apagarLed'])
}).use(middleware.auth()).prefix('/mqtt')


router.group(() => {
  router.get('me', [authController, 'checkClient'])
}).use(middleware.auth()).prefix('/client')




router.get('/sensor-types', [AdminController, 'indexSensorTypes'])
router.post('/getdevices', [RaspberriesController, 'index'])

router.group(() => {
  router.get('/lastdate', [RaspberriesController, 'lastdate'])
  router.get('/last-by-sensor', [RaspberriesController, 'lastBySensor'])
  
}).use(middleware.auth()).prefix('/raspberry')


router.post('/getconfig', [RaspberriesController, 'indexConfig']) //