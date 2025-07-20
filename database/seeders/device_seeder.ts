import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Tank from '#models/tank'
import Device from '#models/device'
import SensorType from '#models/sensor_type'

export default class DatabaseSeeder extends BaseSeeder {
  public async run() {
    const adminUser = await User.updateOrCreate(
      { email: 'admin@admin.com' },
      {
        fullName: 'Admin',
        password: 'cliente1234',
        rol: 'cliente',
      }
    )

    await User.updateOrCreate(
      { email: 'cliente@cliente.com' },
      {
        fullName: 'Cliente',
        password: 'cliente1234',
        rol: 'cliente',
      }
    )

    const sensorType1 = await SensorType.updateOrCreate(
      { code: 'temp' },
      { name: 'temperatura' }
    )

    const sensorType2 = await SensorType.updateOrCreate(
      { code: 'wtr' },
      { name: 'nivel de agua' }
    )

    const tanque1 = await Tank.updateOrCreate(
      { uuid: '1234567890' },
      {
        name: 'Tanque 1',
        description: 'Tanque de prueba',
        userId: adminUser.id,
        isActive: true,
      }
    )

    const tanque2 = await Tank.updateOrCreate(
      { uuid: '1234567891' },
      {
        name: 'Tanque 2',
        description: 'Tanque de prueba',
        userId: adminUser.id,
        isActive: true,
      }
    )

    await Device.updateOrCreate(
      { code: 'temp/1', tankId: tanque1.id },
      { name: 'temperatura' }
    )

    await Device.updateOrCreate(
      { code: 'temp/2', tankId: tanque2.id },
      { name: 'temperatura 2' }
    )

    await Device.updateOrCreate(
      { code: 'wtr/1', tankId: tanque2.id },
      { name: 'nivel de agua' }
    )

    await Device.updateOrCreate(
      { code: 'hmd/1', tankId: tanque2.id },
      { name: 'humedad' }
    )
  }
}
