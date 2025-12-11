import { mockData } from '../mockData'

// Mock data store (in-memory)
export let dataStore = { ...mockData }

// Helper function to get a fresh copy of dataStore (useful for testing or resetting)
export const getDataStore = () => dataStore
export const resetDataStore = () => {
  dataStore = { ...mockData }
}

