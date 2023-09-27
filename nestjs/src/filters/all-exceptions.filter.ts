import {
	Catch,
	ExceptionFilter,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(capturedException: unknown, argumentsHost: ArgumentsHost) {
		const httpContext = argumentsHost.switchToHttp();
		const httpResponse = httpContext.getResponse();
		const httpRequest = httpContext.getRequest();

		const httpStatusCode =
			capturedException instanceof HttpException
				? capturedException.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const errorMessage =
			capturedException instanceof HttpException
				? capturedException.getResponse()
				: 'Internal server error';

		httpResponse.status(httpStatusCode).json({
			statusCode: httpStatusCode,
			message: errorMessage,
			timestamp: new Date().toISOString(),
			requestPath: httpRequest.url,
		});
	}
}
