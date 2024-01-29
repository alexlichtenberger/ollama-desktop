const ollamaAPIBase = 'http://127.0.0.1:11434/api';

export const chatStream = async function* (
	messages: { role: string; content: string }[],
	model: string
) {
	const data = { model, messages, stream: true };

	const response = await fetch(`${ollamaAPIBase}/chat`, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'text/plain;charset=UTF-8'
		}
	});

	const reader = response.body?.getReader();
	if (!reader) return;
	while (true) {
		const { done, value: chunk } = await reader.read();

		if (done) {
			break;
		}

		const value = new TextDecoder().decode(chunk);

		try {
			yield JSON.parse(value);
		} catch (e) {
			return;
		}
	}
};

export const genStream = async function* (text: string, model: string) {
	const response = await fetch(`${ollamaAPIBase}/generate`, {
		method: 'POST',
		body: JSON.stringify({model, prompt: text, options: {num_predict: 100}}),
		headers: {
			'Content-Type': 'text/plain;charset=UTF-8'
		}
	});

	const reader = response.body?.getReader();
	if (!reader) return;
	while (true) {
		const { done, value: chunk } = await reader.read();

		if (done) {
			break;
		}

		const value = new TextDecoder().decode(chunk);

		try {
			yield JSON.parse(value);
		} catch (e) {
			return;
		}
	}
}

export const createModel = async function* (data: { name: string, modelfile: string }) {
	const response = await fetch(`${ollamaAPIBase}/create`, {
		method: 'POST',
		body: JSON.stringify({ ...data, stream: true }),
		headers: {
			'Content-Type': 'text/plain;charset=UTF-8'
		}
	});

	const reader = response.body?.getReader();
	if (!reader) return;
	while (true) {
		const { done, value: chunk } = await reader.read();

		if (done) {
			break;
		}

		const value = new TextDecoder().decode(chunk);

		try {
			yield JSON.parse(value);
		} catch (e) {
			return;
		}
	}
}

export const pullModel = async function* (data: { name: string }) {
	const response = await fetch(`${ollamaAPIBase}/pull`, {
		method: 'POST',
		body: JSON.stringify({ ...data, stream: true }),
		headers: {
			'Content-Type': 'text/plain;charset=UTF-8'
		}
	});

	const reader = response.body?.getReader();
	if (!reader) return;
	while (true) {
		const { done, value: chunk } = await reader.read();

		if (done) {
			break;
		}

		const value = new TextDecoder().decode(chunk);

		try {
			for (let chunk of value.split('\n').filter(chunk => chunk !== '')) yield JSON.parse(chunk)
			// yield JSON.parse(value);
		} catch (e) {
			yield value;
		}
	}
}

export const getModels = async () => {
	return await (await fetch(`${ollamaAPIBase}/tags`)).json()
}

export const delModel = async (model: string) => {
	return await fetch(`${ollamaAPIBase}/delete`, {
		method: 'DELETE',
		body: JSON.stringify({ model }),
		headers: {
			'Content-Type': 'text/plain;charset=UTF-8'
		}
	})
}