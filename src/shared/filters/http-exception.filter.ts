import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones HTTP
 *
 * Maneja todas las excepciones HTTP y las convierte en respuestas JSON
 * formateadas sin exponer información sensible
 *
 * @example
 * ```typescript
 * // En main.ts
 * app.useGlobalFilters(new HttpExceptionFilter());
 * ```
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Obtener el mensaje de error
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    // Log del error (en producción, usar un logger apropiado)
    console.error(
      `[${new Date().toISOString()}] ${request.method} ${request.url} - ${status} - ${message}`,
    );

    // Respuesta formateada sin exponer información sensible
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      // No incluir stack trace en producción
      ...(process.env.NODE_ENV === 'development' && {
        error: exception.name,
      }),
    });
  }
}
