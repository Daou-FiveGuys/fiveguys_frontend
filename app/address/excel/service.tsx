import { Folder2, Group2, Contact2, CommonResponse } from "./entity";

// 폴더 데이터를 가져오는 함수
export const getFolder2Data = async (userId: Number): Promise<Folder2[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/folder2/user/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);

        const result: CommonResponse<Folder2[]> = await response.json();
        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("폴더 데이터 로드 오류:", error);
        return [];
    }
};

// 그룹 데이터를 가져오는 함수
export const getGroup2Data = async (folder2Id: Number): Promise<Folder2[]> => {
  try {
      const response = await fetch(`http://localhost:8080/api/v1/folder2/${folder2Id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);

      const result: CommonResponse<Folder2[]> = await response.json();
      return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
      console.error("그룹 데이터 로드 오류:", error);
      return [];
  }
};

// 연락처 데이터를 가져오는 함수
export const getContact2Data = async (groupId: string): Promise<Contact2[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/contact/id/${groupId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);

        const result: CommonResponse<Contact2[]> = await response.json();
        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("연락처 데이터 로드 오류:", error);
        return [];
    }
};
