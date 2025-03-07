import { API_ORIGIN, SECURE } from 'config';

export class SyncClient {
	private me: { userId: string; name: string } | null = null;
	private socket: SyncSocketClient | null = null;

	constructor() {
		this.authenticate();
	}

	private authenticate = async () => {
		try {
			const meResult = await fetch(
				`${SECURE ? 'https' : 'http'}://${API_ORIGIN}/api/auth/session`,
				{
					credentials: 'include',
				},
			);
			if (meResult.ok) {
				this.me = await meResult.json();
				this.connect();
			}
		} catch (e) {
			console.error(e);
		}
	};

	private connect = async () => {
		this.socket = new SyncSocketClient();
	};

	handleChange = () => {};
}

class SyncSocketClient {
	private ws: WebSocket;
	constructor() {
		this.ws = new WebSocket(`${SECURE ? 'wss' : 'ws'}://${API_ORIGIN}/sync`);
		this.ws.addEventListener('open', this.handleOpen);
	}

	private handleOpen = () => {
		console.log('connected');
		setInterval(() => {
			this.ws.send('ping');
		}, 1000 * 10);

		this.ws.addEventListener('message', this.handleMessage);
	};

	private handleMessage = (event: MessageEvent) => {
		console.log('received: %s', event.data);
	};
}

export const syncClient = new SyncClient();
