export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

export const buildQueryString = (params: QueryParams): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

export interface ApiError {
  message: string;
  code?: string | number;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
}

export const handleApiError = (error: unknown, context: string = 'operação'): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as any).message;
  }
  
  return `Erro desconhecido durante ${context}`;
};

export const handleHttpError = (status: number, message?: string): string => {
  switch (status) {
    case 401:
      return 'Usuário não autenticado. Faça login novamente.';
    case 403:
      return message || 'Acesso negado. Você não tem permissão para esta ação.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Conflito de dados. Verifique as informações enviadas.';
    case 422:
      return message || 'Dados inválidos. Verifique as informações enviadas.';
    case 429:
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    case 500:
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    default:
      return message || `Erro HTTP ${status}: Algo deu errado.`;
  }
};

export const createApiErrorHandler = (entityName: string, operation: string) => {
  return (error: unknown): string => {
    const baseMessage = `Erro ao ${operation} ${entityName}`;
    const errorMessage = handleApiError(error, `${operation} ${entityName}`);
    return errorMessage.includes(baseMessage) ? errorMessage : `${baseMessage}: ${errorMessage}`;
  };
};

export const validateApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = handleHttpError(response.status, errorData.message);
    throw new Error(errorMessage);
  }

  const responseData: ApiResponse<T> = await response.json();
  
  if (!responseData.success) {
    throw new Error(responseData.message || 'Resposta da API indica falha');
  }
  
  return responseData.data as T;
};

export const createApiCall = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    return await validateApiResponse<T>(response);
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};