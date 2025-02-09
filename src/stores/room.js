import axios from 'axios'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { useUserStore } from './user'
import router from '@/router'

const toast = useToast()
const API_URL = 'https://scrumpoker-server.onrender.com/api/v1';
const api = axios.create({
	baseURL: API_URL
});

export const useRoomStore = defineStore('room', {
	state: () => ({
		roomId: null,
		roomName: null,
		status: null,
		median: null,
		average: null,
		users: [],
		votes: [],
		eventSource: null,
	}),
	getters: {
		getTopUsers: (state) => {
			const oddUsers = state.users.filter((_, index) => index % 2 === 1)
			return oddUsers.map((user) => {
				const userVote = state.votes.find((vote) => vote.userId === user.id)
				return {
					...user,
					vote: userVote ? userVote.value : null,
				}
			})
		},
		getBottomUsers: (state) => {
			const evenUsers = state.users.filter((_, index) => index % 2 === 0)
			return evenUsers.map((user) => {
				const userVote = state.votes.find((vote) => vote.userId === user.id)
				return {
					...user,
					vote: userVote ? userVote.value : null,
				}
			})
		},
		getCurrentUserVote: (state) => {
			const user = useUserStore()
			const vote = state.votes.find((vote) => vote.userId === user.userId)
			return vote ? vote.value : null
		},
	},
	actions: {
		async getRoom(roomId) {
			const response = await api.get(`/room/${roomId}`)
			const { data } = response.data
			this.roomId = data.room._id
			this.roomName = data.room.name
		},
		async createRoom(roomName) {
			const response = await api.post('/room/', { name: roomName })
			const { data } = response.data
			this.roomId = data.room._id
			this.roomName = data.room.name
			this.status = data.room.status
			this.median = data.room.median
			this.average = data.room.average
		},
		async enterRoom(roomId) {
			try {
				this.roomId = roomId
				const user = useUserStore()
				this.eventSource = new EventSource(`${API_URL}/room/enter/${roomId}/${user.token}`)

				this.eventSource.addEventListener('joinRoom', () => {
					const data = JSON.parse(event.data)
					this.status = data.status
					this.median = data.median
					this.average = data.average
					this.roomName = data.name
				})

				this.eventSource.addEventListener('usersUpdate', (event) => {
					const data = JSON.parse(event.data)

					/**
					 * data.users = {
					 * 		<userId>: {
					 * 			id: <userId>,
					 * 			name: <userName>
					 * 		}
					 * }
					 */
					this.users = Object.keys(data.users).map((userId) => data.users[userId])
				})

				this.eventSource.addEventListener('votesUpdate', (event) => {
					const data = JSON.parse(event.data)

					const votes = Array.isArray(data.votes) ? data.votes : []

					this.votes = votes

					if (votes.length === this.users.length && !this.status) {
						this.status = 'ready'
					}
				})

				this.eventSource.addEventListener('resultsReveal', (event) => {
					const data = JSON.parse(event.data)
					this.status = 'reveal'
					this.median = data.median
					this.average = data.average
				})

				this.eventSource.addEventListener('resultsReset', () => {
					this.status = null
					this.median = null
					this.average = null
					this.votes = []
				})

				this.eventSource.addEventListener('error', (error) => {
					console.log('error during room connection', error)
					toast.error('Error during room connection, please try again')
					router.push(this.roomId ? `/?id=${this.roomId}` : '/')
				})
			} catch (error) {
				console.error('Cannot enter the room', error)
			}
		},
		async vote(value) {
			try {
				const user = useUserStore()
				await api.post(
					'/room/vote/',
					{
						value: value,
						roomId: this.roomId,
						userId: user.userId,
					},
					{
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					},
				)
			} catch (error) {
				const data = error.response?.data
				console.log('error during voting', data)
				toast.error(data.message)
			}
		},
		async revealResults() {
			try {
				const user = useUserStore()
				await api.post(
					`/room/reveal/`,
					{
						roomId: this.roomId,
					},
					{
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					},
				)
				this.status = 'reveal'
			} catch (error) {
				console.log('error during results reveal', error)
			}
		},
		async resetResults() {
			try {
				const user = useUserStore()
				await api.post(
					`/room/reset/`,
					{
						roomId: this.roomId,
					},
					{
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					},
				)
				this.status = null
			} catch (error) {
				console.log('error during results reset', error)
			}
		},
		async leaveRoom() {
			const user = useUserStore()
			try {
				await api.post(
					'/room/leave/',
					{
						roomId: this.roomId,
						userId: user.userId,
					},
					{
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					},
				)
			} catch (error) {
				const data = error.response?.data
				console.log('error during leaving room', data)
				toast.error(data.message)
			} finally {
				router.push('/')
				this.resetRoomState()
				user.logout()
			}
		},
		resetRoomState() {
			this.roomId = null
			this.roomName = null
			this.status = null
			this.median = null
			this.average = null
			this.users = []
			this.votes = []
		},
		cancelRoomStream() {
			if (this.eventSource) {
				this.eventSource.close()
				this.eventSource = null
			}
			const user = useUserStore()
			user.logout()
			this.resetRoomState()
		},
		copyInviteLink() {
			const url = `${window.location.origin}/?id=${this.roomId}`
			window.navigator.clipboard.writeText(url)
			toast.info('Link copied successfully')
		},
	},
})
