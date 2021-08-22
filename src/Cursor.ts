export class Cursor {
	public index = -1;

	public constructor(public input: string) {}

	public get hasNext() {
		return this.index < this.input.length - 1;
	}

	public get hasPrevious() {
		return this.index > 0;
	}

	public consumeRemaining() {
		let result = '';
		while (this.hasNext) result += this.next();

		return result;
	}

	public consumeWhile(predicate: (char: string) => boolean) {
		let result: string | undefined = undefined;

		while (this.hasNext && predicate(this.peekNext()!)) result = (result ?? '') + this.next();

		return result;
	}

	public skipWhitespace() {
		if (this.peekNext() !== ' ') return false;

		while (this.peekNext() === ' ') this.next();

		return true;
	}

	public next() {
		if (this.hasNext) {
			this.index++;
			return this.input[this.index];
		}
	}

	public previous() {
		if (this.hasPrevious) {
			this.index--;
			return this.input[this.index];
		}
	}

	public peek() {
		return this.input[this.index];
	}

	public peekNext() {
		return this.hasNext ? this.input[this.index + 1] : undefined;
	}

	public peekPrevious() {
		return this.hasPrevious ? this.input[this.index - 1] : undefined;
	}
}
