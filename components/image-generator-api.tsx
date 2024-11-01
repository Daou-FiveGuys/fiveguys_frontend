import axios from 'axios';

interface ImageSource {
  id: string;
  src: string;
}

export async function fetchImageSources(): Promise<ImageSource[] | "error"> {
  try {
    const response = await axios.get('https://codingapple1.github.io/shop/data2.json');// 실험용 'https://codingapple1.github.io/shop/data2.json'

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map((item, index) => ({
        id: (index + 1).toString(),
        src: item.title // API 응답 구조에 따라 이 부분을 조정해야 할 수 있습니다.
      }));
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error) {
    console.error('Error fetching image sources:', error);
    return "error";
  }
}