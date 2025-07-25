import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'
import CloudinaryService from '#services/cloudinary_service'
import { updatedUserValidator } from '#validators/auth'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)

      let profileImageData = null

      if (payload.profileImage) {
        try {
          profileImageData = await CloudinaryService.uploadImage(
            payload.profileImage,
            'profile_pictures'
          )
        } catch (imageError) {
          return response.status(400).json({
            message: 'Error al subir imagen',
            errors: imageError.message,
          })
        }
      }

      const userData = {
        ...payload,
        rol: 'cliente',
        profileImage: profileImageData?.url,
        profileImageId: profileImageData?.publicId,
      }

      const user = await User.create(userData)

      const token = await User.accessTokens.create(user)

      return response.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          rol: user.rol,
          profileImage: user.profileImage,
        },
        token: token.value!.release(),
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Error al registrar usuario',
        errors: error.messages || error.message,
      })
    }
  }

  async CheckAdmin({  response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()


      if (user.rol !== 'admin') {
        return response.unauthorized({
          message: 'Usuario no es autorizado',
        })
      }
      return response.json({
        success: true,
        user :{
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          rol: user.rol,
          profileImage: user.profileImage,
        }
      })
    } catch (error) {
      
    }
  }

  async registerAdmin({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)

      let profileImageData = null

      if (payload.profileImage) {
        try {
          profileImageData = await CloudinaryService.uploadImage(
            payload.profileImage,
            'profile_pictures'
          )
        } catch (imageError) {
          return response.status(400).json({
            message: 'Error al subir imagen',
            errors: imageError.message,
          })
        }
      }

      const userData = {
        ...payload,
        rol: 'admin',
        profileImage: profileImageData?.url,
        profileImageId: profileImageData?.publicId,
      }

      const user = await User.create(userData)
      const token = await User.accessTokens.create(user)

      return response.status(201).json({
        message: 'administrador registrado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          rol: user.rol,
          profileImage: user.profileImage,
        },
        token: token.value!.release(),
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Error al registrar administrador',
        errors: error.messages || error.message,
      })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      const user = await User.verifyCredentials(email, password)

      const token = await User.accessTokens.create(user)

      return response.json({
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          rol: user.rol,
          profileImage: user.profileImage,
        },
        token: token.value!.release(),
      })
    } catch (error) {
      return response.status(401).json({
        message: 'Credenciales inválidas',
        error: error.message,
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const token = auth.user?.currentAccessToken

      if (token) {
        await User.accessTokens.delete(user, token.identifier)
      }

      return response.json({
        message: 'Sesión cerrada exitosamente',
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Error al cerrar sesión',
        error: error.message,
      })
    }
  }

  async me({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      return response.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      return response.status(401).json({
        message: 'Usuario no autenticado',
      })
    }
  }

  async update({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const payload = await request.validateUsing(updatedUserValidator(user.id))

      if (payload.fullName !== undefined) {
        user.fullName = payload.fullName
      }

      if (payload.email !== user.email) {
        user.email = payload.email
      }

      await user.save()

      return response.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          rol: user.rol,
          profileImage: user.profileImage,
        },
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al actualizar el usuario',
        errors: error.messages || error.message,
      })
    }
  }

  async updateProfileImage({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const profileImage = request.file('profileImage', {
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })

      if(!profileImage) {
        return response.status(400).json({
          success: false,
          message: 'Error al subir imagen',
          errors: 'No se ha subido ninguna imagen',
        })
      }

      if(user.profileImageId) {
        await CloudinaryService.deleteImage(user.profileImageId)
      }

      const uploadResult = await CloudinaryService.uploadImage(profileImage)

      user.profileImage = uploadResult.url
      user.profileImageId = uploadResult.publicId

      await user.save()

      return response.json({
        success: true,
        message: 'Imagen actualizada exitosamente',
        user: {
          id: user.id,
          profileImage: user.profileImage,
        },
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al actualizar la imagen de perfil',
        errors: error.messages || error.message,
      })
    }
  } 

  async validateToken({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      if(!user){
        return response.status(401).json({
          message: 'Token no válido',
        })
      }

      return response.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          rol: user.rol,
          profileImage: user.profileImage,
        },
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Token invalido o expirado',
      })
    }
  }

  async checkClient({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      if (user.rol !== 'cliente') {
        return response.status(401).json({
          message: 'Acceso denegado. Solo los clientes pueden realizar esta acción.',
        })
      }

      return response.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          rol: user.rol,
          profileImage: user.profileImage,
        },
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Error al validar el token',
        error: error.message,
      })
    }
  }
}
