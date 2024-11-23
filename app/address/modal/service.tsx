import apiClient from "@/services/apiClient";

type PpurioMessageDTO = {
    messageType: string;
    content: string;
    fromNumber: string;
    targets: Target[];
    subject: string;
};

export type Target = {
    toNumber: string;
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
        PpurioMessageDTO: PpurioMessageDTO,
        multipartFile?: File
    ): Promise<PpurioMessageResponse | undefined> => {
        try {
            const formData = new FormData();

            // PpurioMessageDTO를 FormData에 추가
            formData.append(
                "ppurioMessageDTO",
                new Blob([JSON.stringify(PpurioMessageDTO)], { type: "application/json" })
            );

            // multipartFile이 존재하는 경우에만 추가
            if (multipartFile) {
                formData.append("multipartFile", multipartFile);
            }

            const response = await apiClient.post<CommonResponse<PpurioMessageResponse>>(
                `/ppurio/message`, formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const newMessageResponse = response.data.data;
            if (response.data.code === 200) return newMessageResponse;

            return undefined;
        } catch (error) {
            console.error("Error while sending message:", error);
            return undefined;
        }
    },
};
