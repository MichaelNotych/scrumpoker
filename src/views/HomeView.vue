<script setup>
import router from '@/router';
import { onMounted, reactive, watch } from 'vue';
import { useToast } from 'vue-toastification';
import CommonHeader from '@/components/CommonHeader.vue';
import { useUserStore } from '@/stores/user';
import { useRoomStore } from '@/stores/room';
import ThemeToggle from '@/components/ThemeToggle.vue';

const toast = useToast();

const userStore = useUserStore();
const roomStore = useRoomStore();

const form = reactive({
	action: 'create',
	userName: localStorage.getItem('user-name') || '',
	roomName: '',
	roomId: '',
	isValid: false,
	isLoading: false,
});

watch(form, () => {
	const fieldsToValidate = ['userName'];
	if (form.action === 'create') {
		fieldsToValidate.push('roomName');
	} else if (form.action === 'enter') {
		fieldsToValidate.push('roomId');
	}

	form.isValid = fieldsToValidate.every((field) => form[field].length > 0);
});

onMounted(() => {
	// check for room id in url
	const urlSearch = new URLSearchParams(window.location.search);
	const roomId = urlSearch.get('id'); 
	if (!roomId) return;
	
	form.roomId = roomId;
	form.action = 'enter';
});

const actionHandler = (action) => {
	form.action = action;

	if (action === 'create') {
		// remove id get param when change room action to create
		history.replaceState({}, '', location.pathname);
	}
}
const submitHandler = async () => {
	try {
		// set button loader
		form.isLoading = true;

		// get the room data
		if (form.action === 'create') {
			await roomStore.createRoom(form.roomName);
		} else if (form.action === 'enter') {
			await roomStore.getRoom(form.roomId);
		}

		// sign up user
		await userStore.signup(roomStore.roomId, form.userName);

		// save user name for future
		localStorage.setItem('user-name', form.userName);

		// redirect to room
		router.push(`/room/${roomStore.roomId}`);
		toast.success('Join room successfully');
	} catch (error) {
		console.error('Error during entering/creating room', error);
		toast.error('Invalid data, cannot enter the room');
	} finally {
		form.isLoading = false;
	}
}
</script>

<template>
	<CommonHeader/>
	<section class="wrapper">
		<form class="form" @submit.prevent="submitHandler">
			<input v-model="form.userName" required class="form__input" name="user_name" id="user_name"
				placeholder="Username*" />
			<input v-if="form.action === 'create'" v-model="form.roomName" required class="form__input" name="room_name"
				id="room_name" placeholder="Room name*" />
			<input v-else-if="form.action === 'enter'" v-model="form.roomId" required class="form__input" name="room_id"
				id="room_id" placeholder="Room ID*" />
			<button :class="`form__button ${form.isLoading ? 'loading' : ''}`" :disabled="!form.isValid">{{ form.action === 'create' ? 'Create' : 'Enter' }}</button>
		</form>
		<p class="hint" v-if="form.action === 'create'">
			Want to join existed room?
			<button class="hint__button" @:click="actionHandler('enter')"> Click here </button>
		</p>
		<p class="hint" v-if="form.action === 'enter'">
			Want to create new room?
			<button class="hint__button" @:click="actionHandler('create')"> Click here </button>
		</p>
	</section>
	<ThemeToggle/>
</template>

<style>
.wrapper {
	max-width: 640px;
	padding: 0 1rem;
	width: 100%;
	margin: auto;
}

.form {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.form__input {
	padding: 1rem;
	border-radius: 0.5rem;
	background-color: var(--background-color-light);
	border: 1px solid var(--border-color);
	width: 100%;
	font: inherit;
	color: var(--text-color);
	outline: none;
	transition: border-color 0.3s;
}

.form__input:-webkit-autofill,
.form__input:-webkit-autofill:hover, 
.form__input:-webkit-autofill:focus, 
.form__input:-webkit-autofill:active{
    -webkit-box-shadow: 0 0 0 30px var(--background-color-light) inset !important;
	-webkit-text-fill-color: var(--text-color) !important;
}

.form__input:focus {
	border-color: var(--accent-color);
}

.form__button {
	padding: 1rem 0.5rem;
	border: none;
	background-color: var(--accent-color);
	text-transform: uppercase;
	border-radius: 0.5rem;
	color: var(--accent-button-color);
	transition: background-color 0.3s;
}

.form__button:hover {
	background-color: var(--accent-color-hover);
}

.form__button:disabled {
	pointer-events: none;
	opacity: 0.5;
}

.form__button.loading {
	position: relative;
	pointer-events: none;
}

.form__button.loading::after {
	content: '';
    position: absolute;
    left: calc(50% - 0.75rem);
    top: calc(50% - 0.75rem);
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 100%;
    border: 0.25rem solid var(--accent-button-color);
    border-top-color: var(--accent-color);
    animation: spinner 0.9s linear infinite;
}

.form__button.loading::before {
	content: '';
	position: absolute;
	inset: 0;
	background-color: var(--accent-color);
	border-radius: inherit;
}

@keyframes spinner {
	to {
		transform: rotate(360deg);
	}
}

.hint {
	text-align: center;
}

.hint__button {
	background-color: rgba(0, 0, 0, 0);
	color: var(--accent-color);
	transition: color 0.3s;
	border: none;
	padding: 0;
	margin: 0 0 0 5px;
}
</style>