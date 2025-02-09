<script setup>
import { useRoomStore } from '@/stores/room';

const cards = [0, 1, 2, 3, 5, 8, 13, 21, 34];
const roomStore = useRoomStore();

const voteHander = (vote) => {
	const voteToSubmit = parseInt(vote) === parseInt(roomStore.getCurrentUserVote) ? null : (vote).toString();
	roomStore.vote(voteToSubmit);
}
</script>
<template>
	<div class="cards">
		<button v-for="card in cards" :key="card" @click="voteHander(card)"
			:class="`card ${parseInt(card) === parseInt(roomStore.getCurrentUserVote) ? 'choosed' : ''}`">
			{{ card }}
		</button>
	</div>
</template>
<style>
.cards {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	width: 100%;
	gap: 0.5rem;
}

.card {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 4rem;
	min-width: 4rem;
	height: 5rem;
	font-size: 1.25rem;
	border: 1px solid var(--border-color);
	border-radius: 0.5rem;
	background-color: var(--background-color-light);
	padding: 0;
	transition:
		transform 0.3s,
		border-color 0.3s;
}

@media (max-width: 480px) {
	.card {
		width: 3rem;
		min-width: 3rem;
		height: 4rem;
		font-size: 1rem;
	}
}

.card:not(.choosed):hover {
	transform: scale(1.05);
	border-color: var(--accent-color-hover);
}

.card:not(.choosed):active {
	transform: scale(0.95);
}

.card.choosed {
	background-color: var(--accent-color);
	color: var(--accent-button-color);
}

.card.disabled {
	pointer-events: none;
	opacity: 0.5;
}
</style>