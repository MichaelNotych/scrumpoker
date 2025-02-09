<script setup>
import { useRoomStore } from '@/stores/room';
import CopyIcon from './icons/CopyIcon.vue';

const roomStore = useRoomStore();
</script>
<template>
	<header class="header">
		<div v-if="roomStore.roomName" @click="roomStore.copyInviteLink" class="header__title header__title_room">
			Room: {{ roomStore.roomName }}
			<CopyIcon :width="18" :height="18" />
		</div>
		<div v-else class="header__title">SCRUM poker</div>
		<button v-if="roomStore.roomId" @click="roomStore.leaveRoom" class="header__leave">
			Leave room
		</button>
	</header>
</template>
<style>
.header {
	padding: 1rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.header__title {
	font-size: 1.25rem;
}

.header__title_room {
	cursor: pointer;
	display: flex;
    gap: 10px;
    align-items: center;
	transition: color 0.3s;
}

.header__title_room:hover {
	color: var(--accent-color);
}

.header__leave {
	background-color: var(--background-color);
	color: var(--text-color);
	border: 1px solid var(--border-color);
	border-radius: 0.25rem;
	padding: 0.5rem 1rem;
	transition: background-color 0.3s;
}

.header__leave:hover {
	background-color: var(--background-color-light);
}
</style>