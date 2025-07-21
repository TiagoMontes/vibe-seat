import * as yup from 'yup';

export const loginSchema = yup.object({
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
    .min(3, 'Senha deve ter pelo menos 3 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>; 