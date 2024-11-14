// src/api/getGroupData.ts
import { Groups, CommonResponse } from './types'; // 타입 경로는 파일 위치에 맞게 조정

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
