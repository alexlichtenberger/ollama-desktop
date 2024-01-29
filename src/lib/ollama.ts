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
			console.log(value);
			return;
		}
	}
};
