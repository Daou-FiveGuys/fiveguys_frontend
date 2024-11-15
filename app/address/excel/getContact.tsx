import { Contact, CommonResponse } from "./types";

// Contact 데이터를 가져오는 함수
export const getContacts = async (groupId: string): Promise<Contact[]> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/contact/id/${groupId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("API 요청 실패:", response.status, response.statusText);
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const result: CommonResponse<Contact[]> = await response.json();
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error("데이터 로드 오류:", error);
    
    return [];
  }
};

// Contact 데이터를 엑셀 형식의 2차원 배열로 변환
export const transformContactsToExcelData = (contacts: Contact[]): string[][] => {
  const transformedData = contacts.map((contact) => [
    contact.groups.groupsName,
    contact.name.toString(),
    contact.telNum.toString(),
    "", "", "", "", "", "", "", ""
  ]);

  // 50행으로 고정
  while (transformedData.length < 50) {
    transformedData.push(Array(11).fill(""));
  }

  return transformedData;
};
