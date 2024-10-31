import axios from 'axios';

interface ImageSource {
  id: string;
  src: string;
}

export async function fetchImageSources(): Promise<ImageSource[] | "error"> {
  try {
    const response = await axios.post('YOUR_API_ENDPOINT_HERE', {
      // API에 필요한 요청 데이터를 여기에 추가하세요
      // 예: prompt: "Generate 4 images"
    });

    if (response.data && Array.isArray(response.data) && response.data.length === 4) {
      return response.data.map((item, index) => ({
        id: (index + 1).toString(),
        src: item.url // API 응답 구조에 따라 이 부분을 조정해야 할 수 있습니다.
      }));
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error) {
    console.error('Error fetching image sources:', error);
    return "error";
  }
}