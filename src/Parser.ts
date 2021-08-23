import {Cursor} from './Cursor';
import {NamedArgumentToken, PositionalArgumentToken} from './Tokens';

export class Parser {
	public cursor = new Cursor(this.input);

	public constructor(public input: string) {}

	public get hasNext() {
		return this.cursor.hasNext;
	}

	public parseNamed() {
		const tokens: NamedArgumentToken[] = [];
		let buffer = '';
		let outputBuffer = '';
		let isQuoted = false;
		let isFlag = false;
		let isFlagValue = false;
		let flagName = '';
		let isKeyword = false;
		let keywordName = '';

		while (this.cursor.hasNext) {
			const char = this.cursor.next();

			const canBeQuoted = !isQuoted && (!(isFlag && !isFlag) || isKeyword);

			if (char === '"' && buffer.length === 0 && canBeQuoted) {
				isQuoted = true;
				continue;
			}

			if (char === '-' && this.cursor.peekNext() === '-' && buffer.length === 0 && !isFlag && !isKeyword) {
				this.cursor.next();
				isFlag = true;
				continue;
			}

			if (char === '=' && buffer.length > 0 && !isKeyword && !isFlag) {
				keywordName = buffer;
				buffer = '';
				isKeyword = true;
				continue;
			}

			if (char === '\\' && this.cursor.peekNext() === '"' && isQuoted) {
				buffer += '"';
				this.cursor.next();
				continue;
			}

			if (char === '"' && isQuoted) {
				if (isFlagValue) {
					tokens.push(new NamedArgumentToken(flagName, buffer));
					flagName = '';
					isFlag = false;
					isFlagValue = false;
				} else if (isKeyword) {
					tokens.push(new NamedArgumentToken(keywordName, buffer));
					keywordName = '';
					isKeyword = false;
				} else {
					outputBuffer += `\"${buffer}\"`;
					this.cursor.skipWhitespace();
				}

				buffer = '';
				isQuoted = false;
				continue;
			}

			if (char === ' ' && !isQuoted) {
				if (isFlag) {
					if (!isFlagValue) {
						flagName = buffer;
						isFlagValue = true;
					} else {
						tokens.push(new NamedArgumentToken(flagName, buffer));
						this.cursor.skipWhitespace();
						flagName = '';
						isFlag = false;
						isFlagValue = false;
					}
				} else if (isKeyword) {
					tokens.push(new NamedArgumentToken(keywordName, buffer));
					this.cursor.skipWhitespace();
					keywordName = '';
					isKeyword = false;
				} else {
					outputBuffer += `${buffer} `;
				}

				buffer = '';
				continue;
			}

			buffer += char;
		}

		if (buffer.length > 0) {
			if (isFlag) {
				if (isFlagValue) tokens.push(new NamedArgumentToken(flagName, buffer));
			} else if (isKeyword) tokens.push(new NamedArgumentToken(keywordName, buffer));
			else outputBuffer += buffer;
		}

		this.cursor = new Cursor(outputBuffer.trim());

		return tokens;
	}

	public peekNext() {
		const currentIndex = this.cursor.index;
		const token = this.parseNext();
		this.cursor.index = currentIndex;

		return token;
	}

	public parseNext() {
		let token: PositionalArgumentToken | undefined;
		let buffer = '';
		let isQuoted = false;

		while (this.cursor.hasNext) {
			const char = this.cursor.next();

			if (char === '"' && buffer.length === 0 && !isQuoted) {
				isQuoted = true;
				continue;
			}

			if (char === '\\' && this.cursor.peekNext() === '"' && isQuoted) {
				buffer += '"';
				this.cursor.next();
				continue;
			}

			if (char === '"' && isQuoted) {
				token = new PositionalArgumentToken(buffer);
				this.cursor.skipWhitespace();
				buffer = '';
				break;
			}

			if (char === ' ' && !isQuoted) {
				token = new PositionalArgumentToken(buffer);
				this.cursor.skipWhitespace();
				buffer = '';
				break;
			}

			buffer += char;
		}

		if (buffer.length > 0) token = new PositionalArgumentToken(buffer);

		return token;
	}

	public consumeRemaining() {
		return this.cursor.consumeRemaining();
	}

	public consumeWhile(predicate: (char: string) => boolean) {
		const result = this.cursor.consumeWhile(predicate);
		if (result) this.cursor.skipWhitespace();
		return result;
	}

	public peekRemaining() {
		const currentIndex = this.cursor.index;
		const result = this.cursor.consumeRemaining();
		this.cursor.index = currentIndex;

		return result;
	}

	public peekWhile(predicate: (char: string) => boolean) {
		const currentIndex = this.cursor.index;
		const result = this.cursor.consumeWhile(predicate);
		this.cursor.index = currentIndex;

		return result;
	}
}
