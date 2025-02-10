<script setup>
import { useRoomStore } from '@/stores/room';
import CopyIcon from './icons/CopyIcon.vue';
import CustomButton from './CustomButton.vue';

const roomStore = useRoomStore();
</script>
<template>
	<header class="header">
		<div v-if="roomStore.roomName" @click="roomStore.copyInviteLink" class="header__title header__title_room">
			Room: {{ roomStore.roomName }}
			<CopyIcon :width="18" :height="18" />
		</div>
		<div v-else class="header__title">SCRUM poker</div>
		<CustomButton v-if="roomStore.roomId" @click="roomStore.leaveRoom" :is-loading="roomStore.isLeaving" type="secondary">Leave room</CustomButton>
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
</style>