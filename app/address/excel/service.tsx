import apiClient from "@/services/apiClient";
import { Folder2, Group2, Contact2, CommonResponse } from "./entity";

// 폴더 데이터를 가져오는 함수
export const getFolder2Data = async (userId: Number): Promise<Folder2[]> => {
    try {
        const response = await apiClient.get<CommonResponse<Folder2[]>>(`/folder2/user/${userId}`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error("폴더 데이터 로드 오류:", error);
        return [];
    }
};

// 그룹 데이터를 가져오는 함수
export const getGroup2Data = async (folder2Id: Number): Promise<Folder2[]> => {
    try {
        const response = await apiClient.get<CommonResponse<Folder2[]>>(`/folder2/${folder2Id}`);
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error("그룹 데이터 로드 오류:", error);
        return [];
    }
};

// 연락처 데이터를 가져오는 함수
export const getContact2Data = async (group2Id: Number): Promise<Contact2[]> => {
    try {
        const response = await apiClient.get<CommonResponse<Group2>>(`/group2/${group2Id}`);
        const group2 = response.data.data;

        if (group2 && group2.contact2s) {
            return group2.contact2s;
        }

        console.warn("No contacts found for the specified group.");
        return [];
    } catch (error) {
        console.error("연락처 데이터 로드 오류:", error);
        return [];
    }
};

// 엑셀에 있는 연락처 정보를 저장하는 함수
export const patchGroup2Data = async (group2Id: Number, contact2s: Array<Contact2>) => {
    try {
        // 요청 JSON 출력 (디버깅용)
        console.log("Request JSON:", JSON.stringify(contact2s, null, 2));

        const response = await apiClient.patch<CommonResponse<Group2>>(`/group2/${group2Id}`, contact2s);

        const updatedGroup = response.data.data;

        if (updatedGroup && updatedGroup.contact2s) {
            console.log("Updated contacts:", updatedGroup.contact2s);
            return updatedGroup.contact2s;
        }

        console.warn("No contacts found for the specified group.");
        return [];
    } catch (error) {
        console.error("연락처 데이터 로드 오류:", error);
        return [];
    }
};
