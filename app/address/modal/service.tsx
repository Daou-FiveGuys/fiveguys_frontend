import apiClient from "@/services/apiClient";

type PpurioMessageDTO = {
    messageType: string;
    content: string;
    fromNumber: string;
    targets: Target[];
    subject: string;
    files: Files;
};

type Target = {
    to: string;
    name: string;
    changeWord: ChangeWord;
};

type ChangeWord = {
    var1: string;
    var2: string;
    var3: string;
    var4: string;
    var5: string;
    var6: string;
    var7: string;
};

type Files = {
    name: String;
    size: Number;
    data: String;
};

type PpurioMessageResponse = {
    code: String;
    description: String;
    refKey: String;
    messageKey: String;
};

export interface CommonResponse<T> {
    code: number;
    message: string;
    data: T;
  }

export const api = {
    sendMessage: async (
        PpurioMessageDTO : PpurioMessageDTO
    ): Promise<PpurioMessageResponse|undefined> => {
        try {
            const response = await apiClient.post<CommonResponse<PpurioMessageResponse>>(`/ppurio/message`, PpurioMessageDTO)

            const newFolder2 = response.data.data;
            if(response.data.code == 200) return newFolder2
    
            return undefined;
        } catch(error) {
            return undefined
        }
    },
}