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
export const getContact2Data = async (group2Id: Number): Promise<Contact2[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/group2/${group2Id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);

        const result: CommonResponse<Group2> = await response.json();

        // Group2 데이터에서 연락처 데이터를 추출하여 반환
        if (result.data && result.data.contact2s) {
            return result.data.contact2s;
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

        const response = await fetch(`http://localhost:8080/api/v1/group2/${group2Id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contact2s), // List<Contact2>로 요청 바디를 전달
        });

        if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);

        const result: CommonResponse<Group2> = await response.json();

        if (result.data && result.data.contact2s) {
            console.log("Updated contacts:", result.data.contact2s);
            return result.data.contact2s;
        }

        console.warn("No contacts found for the specified group.");
        return [];
    } catch (error) {
        console.error("연락처 데이터 로드 오류:", error);
        return [];
    }
};