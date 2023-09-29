import {
	Catch,
	ExceptionFilter,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets'; // Importing WsException class for WebSocket

// This is a global filter that will catch all unhandled throws from
// HTTP and WS processes
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		// Log the exception to the console for debugging

		// Determine the context type: 'http' or 'ws' (WebSocket)
		const type = host.getType();

		// If the exception stems from an HTTP initiated process
		if (type === 'http') {
			const context = host.switchToHttp();
			const response = context.getResponse();
			const request = context.getRequest();

			const status =
				exception instanceof HttpException
					? exception.getStatus()
					: HttpStatus.INTERNAL_SERVER_ERROR;

			let detailedMessage = exception['message'] || 'Internal server error';

			if (exception instanceof HttpException) {
				const response = exception.getResponse();
				detailedMessage = response['message']
					? response['message']
					: detailedMessage;
			}

			response.status(status).json({
				statusCode: status,
				message: detailedMessage,
				timestamp: new Date().toISOString(),
				path: request.url,
			});
		}
		// If it stems from a socket-initiated process
		else if (type === 'ws') {
			// Switch to WebSocket context
			const ctx = host.switchToWs();
			// Get the WebSocket client object
			const client = ctx.getClient();

			const status =
				exception instanceof WsException
					? exception.getError()
					: 'Internal server error';

			// Send a message to the client over the WebSocket
			client.emit('exception', {
				statusCode: 'error',
				message: status,
				timestamp: new Date().toISOString(),
			});
		}
	}
}
