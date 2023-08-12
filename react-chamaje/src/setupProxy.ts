import { createProxyMiddleware } from 'http-proxy-middleware';

const proxyOptions = {
	target: 'http://localhost:3000', // Your backend server URL
	changeOrigin: true,
};

export const setupProxy = (app: any) => {
	app.use('/api', createProxyMiddleware(proxyOptions));
};
