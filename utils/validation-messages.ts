export const validationMessages = {
  fullName: {
    required: 'El nombre es obligatorio',
    minLength: 'El nombre debe tener al menos 2 caracteres',
    maxLength: 'El nombre debe tener máximo 100 caracteres',
  },
  email: {
    required: 'El correo electrónico es obligatorio',
    email: 'El correo electrónico no es válido',
    unique: 'El correo electrónico ya está registrado',
  },
};
