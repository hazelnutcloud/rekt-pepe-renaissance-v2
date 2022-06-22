import type { ethers } from 'ethers'
import { readable, writable } from 'svelte/store'

export const accounts = writable<string[]>([])
export const provider = writable<ethers.providers.Web3Provider | undefined>(undefined)