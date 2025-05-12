import { Prisma } from '@prisma/client';

export function handlePrismaError(error: any): { status: number; message: string } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          status: 400,
          message: 'El valor ya existe y debe ser único (conflicto de duplicado).',
        };

      case 'P2003':
        const field = error.meta?.field_name || 'campo de referencia';
        return {
          status: 400,
          message: `La referencia proporcionada en "${field}" no existe o es inválida.`,
        };

      case 'P2025':
        return {
          status: 404,
          message: 'No se encontró el registro solicitado.',
        };

      default:
        return {
          status: 500,
          message: `Error de base de datos (code: ${error.code})`,
        };
    }
  }

  return {
    status: 500,
    message: 'Error inesperado del servidor.',
  };
}
