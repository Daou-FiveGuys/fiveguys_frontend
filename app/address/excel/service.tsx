import { Groups, Contact, CommonResponse } from './entity';

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

export const getGroupData = async (userId: string): Promise<Groups[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/groups/all/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('API 요청 실패:', response.status, response.statusText);
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        const result: CommonResponse<Groups[]> = await response.json();
        console.log('Fetched group data:', result);

        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        return [];
    }
};
  