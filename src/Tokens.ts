export interface Token<T> {
	readonly data: T;
}

export class PositionalArgumentToken implements Token<string> {
	public constructor(public data: string) {}
}

export class NamedArgumentToken implements Token<string> {
	public constructor(public name: string, public data: string) {}
}
