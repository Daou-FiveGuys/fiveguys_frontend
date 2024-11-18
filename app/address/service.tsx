import { Folder2, Contact2 } from './entity'

  // Simulated API control code
export const api = {
    // createFolder: async (
    //   name: string,
    //   parentId: string | null
    // ): Promise<Folder2> => {
    //   await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
    //   return { id: Date.now().toString(), name, subFolders: [], addresses: [] }
    // },
    // updateFolder: async (
    //   id: string,
    //   name: string
    // ): Promise<{ id: string; name: string }> => {
    //   await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
    //   return { id, name }
    // },
    // deleteFolder: async (id: string): Promise<boolean> => {
    //   await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
    //   return true
    // },
    // createAddress: async (
    //   address: Omit<Contact2, 'id'>,
    //   folderId: string
    // ): Promise<Contact2> => {
    //   await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
    //   return { ...address, id: Date.now().toString() }
    // },
    // updateAddress: async (address: Contact2): Promise<Contact2> => {
    //   await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
    //   return address
    // },
    // deleteAddress: async (id: string): Promise<boolean> => {
    //   await new Promise((resolve) => setTimeout(resolve, 500)) // Simulated delay
    //   return true
    // }
}

export type { Contact2 };
  