<script lang="ts">
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import { chatStream } from '$lib/ollama';
	import ollama from 'ollama';
	import { onMount } from 'svelte';

	let chats: { role: string; content: string }[] = [];
	let models: string[] = [];
	let stream = true;
	let loading = false;
	let role = 'user';
	let content = '';
	let model = 'llama2';

	const loadModels = async () => {
		const res = await ollama.list();
		models = res.models.map((model) => model.name);
	};

	onMount(async () => {
		await loadModels();
		model = models[0];
	});

	const sendMessage = async (e: Event) => {
		e.preventDefault();

		loading = true;
		const message = { role, content };
		chats = [...chats, message];

		content = '';

		const chatGenerator = chatStream(chats, model);

		chats = [...chats, { role: 'assistant', content: '' }];

		for await (let part of chatGenerator) {
			// if (part.message.content === '\n') part.message.content = '<br>';
			chats[chats.length - 1].content += part.message.content;
			document.getElementById('bottom')?.scrollIntoView();
		}

		loading = false;
	};

	// new model creation
	let modelList = ['codellama', 'llama2', 'mistral'];

	let modelName = '';
	let modelFile = '';
	let creatingModel = false;
	const createModel = async (e: Event) => {
		e.preventDefault();

		creatingModel = true;

		await ollama.create({ model: modelName, modelfile: modelFile });
		await loadModels;

		model = modelName;

		modelName = '';
		modelFile = '';
		creatingModel = false;
	};

	let modelPull: string;
	let modelManage: string;
</script>

<article class="h-screen max-h-screen overflow-hidden">
	<section class="col items-stretch">
		<div class="self-fill col overflow-y-auto bd-b p-md" id="chats">
			<div class="self-fill"></div>
			<div class="col g-gap-md pb-md">
				{#each chats as chat}
					<ChatBubble user={chat.role === 'user'} content={chat.content} />
				{/each}
			</div>
			<div id="bottom"></div>
		</div>
		<form on:submit|preventDefault={sendMessage} class="w-full row content-fill">
			<fieldset class="m-md" disabled={loading}>
				<select name="role" id="role" bind:value={role} disabled={loading}>
					<option value="user">USER</option>
					<option value="system">SYSTEM</option>
				</select>
				<input
					class="self-fill"
					type="text"
					name="message"
					id="message"
					placeholder="Enter your prompt..."
					bind:value={content}
					disabled={loading}
				/>
				<button type="submit" disabled={loading}>Send</button>
			</fieldset>
		</form>
	</section>
	<aside class="min-w-64 bd-r h-full min-h-0 col">
		<h2 class="bd-b px-md py-sm m-0">Ollama Studio</h2>
		<div class="p-md overflow-y-auto">
			<h3 class="m-0">Settings</h3>
			<details>
				<summary class="mb-sm"><b>Ollama</b></summary>
				<div class="mb-md">
					<label for="model" class="mb-xs">Model:</label><br />
					<select name="model" id="model" class=" w-full mb-md" bind:value={model}>
						{#each models as model}
							<option value={model}>{model}</option>
						{/each}
					</select>
					<label for="stream" class="row content-between">
						Stream Responses
						<input type="checkbox" name="stream" id="stream" role="switch" bind:checked={stream} />
						<label for="stream"></label>
					</label>
				</div>
			</details>
			<details>
				<summary class="mb-sm"><b>Appearance</b></summary>
				<label for="as-dark-mode-system" class="as-button max-w-full content-start"
					>Use System Theme</label
				>
				<label for="as-dark-mode-light" class="as-button max-w-full content-start"
					>Use Light Theme</label
				>
				<label for="as-dark-mode-dark" class="as-button max-w-full content-start"
					>Use Dark Theme</label
				>
			</details>
			<h3 class="m-0">Models</h3>
			<details>
				<summary class="mb-sm"><b>Pull Model</b></summary>
				<form on:submit|preventDefault={() => console.log('custom model')}>
					<label for="modelPull" class="mb-xs">Model:</label><br />
					<select name="modelPull" id="modelPull" class=" w-full mb-md" bind:value={modelPull}>
						{#each modelList as model}
							<option value={model}>{model}</option>
						{/each}
					</select>
					<button type="submit" class="max-w-full w-full mb-md">Pull</button>
				</form>
			</details>
			<details>
				<summary class="mb-sm"><b>Create Custom Model</b></summary>
				<form on:submit|preventDefault={createModel} class="col">
					<input
						type="text"
						name="modelName"
						id="modelName"
						placeholder="Model Name"
						class="mb-sm"
						bind:value={modelName}
						disabled={creatingModel}
					/>
					<textarea
						name="modelfile"
						id="modelfile"
						class="w-full"
						rows="10"
						placeholder="Place your modelfile text here..."
						bind:value={modelFile}
						disabled={creatingModel}
					></textarea>
					<div class="row items-center g-gap-sm pt-sm pb-md">
						<button type="submit" class=" max-w-full self-fill" disabled={creatingModel}>
							Create Model
						</button>
						{#if creatingModel}
							<progress class="bd-white"></progress>
						{/if}
					</div>
				</form>
			</details>
			<details>
				<summary class="mb-sm"><b>Manage Local Models</b></summary>
				<form on:submit|preventDefault={() => console.log('custom model')}>
					<label for="model-manage" class="mb-xs">Select a Model:</label><br />
					<select
						name="model-manage"
						id="model-manage"
						class=" w-full mb-md"
						bind:value={modelManage}
					>
						{#each models as model}
							<option value={model}>{model}</option>
						{/each}
					</select>
					<button type="submit" class=" max-w-full w-full mb-md">Delete</button>
				</form>
			</details>
		</div>
		<div class="self-fill"></div>
		<button class="m-md max-w-full" on:click={() => (chats = [])}>Clear Chat</button>
	</aside>
	<footer class="px-md max-h-6 bd-t tx-text-mute row content-between">
		<span> </span>
		<span>
			Active Model: <span class="px-xs">{model}</span> | Response Streaming:
			<span class="px-xs">{stream ? 'Enabled' : 'Disabled'}</span>
		</span>
	</footer>
</article>
