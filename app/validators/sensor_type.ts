import vine from '@vinejs/vine'

export const SensorTypevalidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(30),
    code: vine.string().trim().minLength(3).maxLength(30),
  })
)