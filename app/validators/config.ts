import vine from '@vinejs/vine'

export const addConfigValidator = vine.compile(
  vine.object({
    config_type: vine.string().minLength(1),

    config_value: vine.string().minLength(1),

    code: vine.string().minLength(1),

    config_day: vine.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
  })
)

export const updateConfigValidator = vine.compile(
  vine.object({
    config_value: vine.string().minLength(1).optional(),

    config_day: vine.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).optional(),
  })
)
