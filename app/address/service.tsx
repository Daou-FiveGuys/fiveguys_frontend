import { Folder, AddressEntry } from './entity'

  // Simulated API control code
export const api = {
    createFolder: async (
      name: string,
      parentId: string | null
    ): Promise<Folder> => {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
      return { id: Date.now().toString(), name, subFolders: [], addresses: [] }
    },
    updateFolder: async (
      id: string,
      name: string
    ): Promise<{ id: string; name: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
      return { id, name }
    },
    deleteFolder: async (id: string): Promise<boolean> => {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
      return true
    },
    createAddress: async (
      address: Omit<AddressEntry, 'id'>,
      folderId: string
    ): Promise<AddressEntry> => {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
      return { ...address, id: Date.now().toString() }
    },
    updateAddress: async (address: AddressEntry): Promise<AddressEntry> => {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
      return address
    },
    deleteAddress: async (id: string): Promise<boolean> => {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
      return true
    }
}

export type { AddressEntry };
  