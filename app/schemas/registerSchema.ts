import * as yup from 'yup';

export const registerSchema = yup.object({
  username: yup
    .string()
    .required('Usuário é obrigatório')
    .min(2, 'Usuário deve ter pelo menos 2 caracteres')
    .max(50, 'Usuário deve ter no máximo 50 caracteres')
    .matches(
      /^[a-zA-Z0-9._-]+$/,
      'Usuário deve conter apenas letras, números, pontos, hífens ou underscores'
    ),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  confirmPassword: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('password')], 'As senhas devem ser iguais'),
  roleId: yup
    .number()
    .required('Selecione uma role')
    .positive('Role deve ser selecionada')
    .integer('Role deve ser um número válido'),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>; 