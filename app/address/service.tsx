import apiClient from '@/services/apiClient';
import { Folder2, Contact2, CommonResponse, Group2 } from './entity'

  // Simulated API control code
export const api = {
    createFolder: async (
      folder2Name: String
    ): Promise<Folder2|undefined> => {
      try {
        const response = await apiClient.post<CommonResponse<Folder2>>(`/folder2/${folder2Name}`, {})
        
        let newFolder2 = response.data.data;
        if(response.data.code == 200) {
          newFolder2.group2s = []
          return newFolder2
        }

        return undefined;
      } catch(error) {
        return undefined
      }
    },

    readFolder: async () : Promise<Folder2[]|undefined> => {
      try {
        const response = await apiClient.get<CommonResponse<Folder2[]>>(`/folder2/user`)

        const folder2List = response.data.data;
        if(response.data.code == 200) return folder2List
        return undefined
      } catch(error) {
        return undefined
      }
    },

    updateFolder: async (
      folder2:Folder2,
    ): Promise<Folder2 | undefined> => {
      try {
        const response = await apiClient.patch<CommonResponse<Folder2>>(`/folder2/`, {
          folder2Id: folder2.folderId,
          name: folder2.name
        })
        
        const updatedFolder2 = response.data.data;
        if(response.data.code == 200) return updatedFolder2

        return undefined
      } catch(error) {
        return undefined
      }
    },
    
    deleteFolder: async (folder2Id: Number): Promise<boolean> => {
      try {
        const response = await apiClient.delete<CommonResponse<Folder2>>(`/folder2/${folder2Id}`)

        const deletedFolder2 = response.data.data;
        if(response.data.code == 200) return true
        return false
      } catch(error) {
        return false
      }
    },

    createGroup: async (
      group2Name: String,
      folder2: Folder2
    ): Promise<Group2|undefined> => {
      try {
        const response = await apiClient.post<CommonResponse<Group2>>(`/group2/`, 
          {
            folder2Id: folder2.folderId,
            name: group2Name
          })
        
        const newGroup2 = response.data.data;
        if(response.data.code == 200) return newGroup2

        return undefined;
      } catch(error) {
        return undefined
      }
    },

    updateGroup2: async (
      group2: Group2
    ): Promise<Group2|undefined> => {
      try {
        const response = await apiClient.patch<CommonResponse<Group2>>(`/group2/`, {
          group2Id: group2.groupsId,
          // folder2Id: folder2Id << 폴더 이전에 대한 기능은 없음
          name: group2.name
        })
        
        const updatedGroup2 = response.data.data;
        if(response.data.code == 200) return updatedGroup2

        return undefined
      } catch(error) {
        return undefined
      }
    },
    
    deleteGroup: async (group2Id: Number): Promise<boolean> => {
      try {
        const response = await apiClient.delete<CommonResponse<Group2>>(`/group2/${group2Id}`)

        const deletedGroup2 = response.data.data;
        if(response.data.code == 200) return true
        return false
      } catch(error) {
        return false
      }
    },

    createAddress: async (
      contact2: Contact2,
      group2Id: Number
    ): Promise<Contact2|undefined> => {
      try {
        const response = await apiClient.post<CommonResponse<Contact2>>(`/contact2/`, {
          group2Id: group2Id,
          name: contact2.name,
          telNum: contact2.telNum,
          one: contact2.one,
          two: contact2.two,
          three: contact2.three,
          four: contact2.four,
          five: contact2.var5,
          six: contact2.var6,
          seven: contact2.var7,
          eight: contact2.var8
        })

        const newContact2 = response.data.data;
        if(response.data.code == 200) return newContact2

        return undefined;
      } catch(error) {
        return undefined
      }
    },
    
    updateAddress: async (
      contact2: Contact2
    ): Promise<Contact2 | undefined> => {
      try{
        const response = await apiClient.patch<CommonResponse<Contact2>>(`/contact2/`, {
          contact2: contact2.contactId,
          name: contact2.name,
          telNum: contact2.telNum,
          one: contact2.one,
          two: contact2.two,
          three: contact2.three,
          four: contact2.four,
          five: contact2.var5,
          six: contact2.var6,
          seven: contact2.var7,
          eight: contact2.var8
        })

        const newContact2 = response.data.data;
        if(response.data.code == 200) return newContact2

        return undefined;
      } catch(error) {
        return undefined
      }
    },

    deleteAddress: async (contact2Id: number): Promise<Contact2|undefined> => {
      try{
        const response = await apiClient.delete<CommonResponse<Contact2>>(`/contact2/${contact2Id}`)

        const removedContact2 = response.data.data;
        if(response.data.code == 200) return removedContact2
        return undefined
      } catch(error) {
        return undefined
      }
    }
};

export type { Contact2 };
  