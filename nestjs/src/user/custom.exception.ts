export class UsernameConflictException extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UsernameConflictException';
	}
}

export class InvalidEmailException extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidEmailException';
	}
}

// TODO: delete or not ?
