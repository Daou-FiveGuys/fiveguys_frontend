export type AddressEntry = {
    id: string
    name: string
    phoneNumber: string
    var1?: string
    var2?: string
    var3?: string
    var4?: string
}

export type SearchResult = {
    folder: Folder
    addresses: AddressEntry[]
  }
  
export type Folder = {
    id: string
    name: string
    subFolders: Folder[]
    addresses: AddressEntry[]
}