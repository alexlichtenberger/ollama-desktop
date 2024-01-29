<script lang="ts">
	export let user: boolean;
	export let content: string;

	import markdownit from 'markdown-it';
	import { beforeUpdate } from 'svelte';
	let md = markdownit();

	let message: string;

	beforeUpdate(() => {
		message = md.render(content);
	});
</script>

<div
	class="px-md bd-rad h-fit-content w-fit-content max-w-256 {user
		? 'primary self-end ml-xl'
		: 'bd mr-xl'}"
>
	{#if content === ''}
		<progress class="my-md"></progress>
	{:else}
		{@html message}
	{/if}
</div>
