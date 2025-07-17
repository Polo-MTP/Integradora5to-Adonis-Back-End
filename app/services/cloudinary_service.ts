import { v2 as cloudinary } from 'cloudinary'
import env from '#start/env'

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
      api_key: env.get('CLOUDINARY_API_KEY'),
      api_secret: env.get('CLOUDINARY_API_SECRET'),
    })
  }

  async uploadImage(file: any, folder: string = 'profile_pictures'): Promise<any> {
    try {
      const result = await cloudinary.uploader.upload(file.tmpPath, {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { format: 'webp' }
        ]
      })
      
      return {
        url: result.secure_url,
        publicId: result.public_id
      }
    } catch (error) {
      throw new Error(`Error uploading image: ${error.message}`)
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      throw new Error(`Error deleting image: ${error.message}`)
    }
  }
}

export default new CloudinaryService()