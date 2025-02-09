<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import CopyIcon from '@/components/icons/CopyIcon.vue';
import { useRoomStore } from '@/stores/room';
import UserCard from '@/components/UserCard.vue';
import CommonHeader from '@/components/CommonHeader.vue';
import VoteCards from '@/components/VoteCards.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

const route = useRoute();
const roomStore = useRoomStore();

onMounted(() => {
	// set up room connection on mount
	roomStore.enterRoom(route.params.id);

	// clean up room connection on leave
	window.addEventListener('popstate', function(event) {
		console.log('popstate', event);
		if (!event.state.current.includes('/room/')) {
			roomStore.cancelRoomStream();
		}
	});
});
</script>

<template>
	<CommonHeader/>
	<section class="room">
		<div class="room__wrapper">
			<div class="room__users">
				<UserCard v-for="(user, index) in roomStore.getTopUsers" :key="index" :user="user" :roomStatus="roomStore.status" />
			</div>
			<div class="room__table">
				<div v-if="roomStore.status === 'reveal'" class="room__reveal">
					<div class="room__results">
						<span class="room__explain">Average</span>
						<span class="room__explain">Median</span>
						<span class="room__result">{{roomStore.average}}</span>
						<span class="room__result">{{roomStore.median}}</span>
					</div>
					<button class="room__button" @click="roomStore.resetResults">Reset game</button>
				</div>
				<button v-else-if="roomStore.users.length === 1" @click="roomStore.copyInviteLink" class="room__button">
					Copy invite link<CopyIcon :width="18" :height="18" :color="'#fff'"/>
				</button>
				<button v-else-if="roomStore.status === 'ready'" class="room__button" @click="roomStore.revealResults">Show results</button>
				<div v-else>Pick your cards!</div>
			</div>
			<div class="room__users">
				<UserCard v-for="(user, index) in roomStore.getBottomUsers" :key="index" :user="user" :roomStatus="roomStore.status" />
			</div>
		</div>
		<VoteCards />
	</section>
	<ThemeToggle/>
</template>

<style>
.room {
	width: 100%;
	margin: auto;
	display: flex;
	flex-direction: column;
	padding: 4rem;
}

@media (max-width: 480px) {
	.room {
		padding: 1rem;
	}
}

.room__wrapper {
	margin: auto 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	padding: 3rem 0;
}

@media (max-width: 480px) {
	.room {
		padding: 0 0 2rem;
	}
}

.room__users {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.room__table {
	width: 18rem;
	height: 10rem;
	background-color: var(--background-color-light);
	border-radius: 1rem;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 1rem;
}

.room__reveal {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.room__results {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 2fr;
	column-gap: 0.5rem;
	text-align: center;
}

.room__explain {
	color: var(--text-color);
	opacity: 0.5;
}

.room__result {
	font-size: 2rem;
	line-height: 1;
}

.room__button {
	font-size: 1rem;
	padding: 0.5rem 1rem;
	border: none;
	background-color: var(--accent-color);
	border-radius: 0.25rem;
	color: var(--accent-button-color);
	display: flex;
	align-items: center;
	gap: 0.5rem;
	transition: background-color 0.3s, transform 0.3s;
}

.room__button:hover {
	transform: scale(1.05);
	background-color: var(--accent-color-hover);
}

.room__button:active {
	transform: scale(0.95);
}
</style>
