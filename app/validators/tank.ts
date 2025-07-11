import vine from '@vinejs/vine'

export const Tankvalidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(5).maxLength(30),
    description: vine.string().trim().minLength(5).maxLength(30),
  })
)
