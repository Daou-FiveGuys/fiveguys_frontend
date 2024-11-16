import axios from 'axios';

interface ImageSource {
  requestId: string;
  url: string;
}
//response 형식

export async function fetchImageSources(prompt: string): Promise<ImageSource[] | { error: string }> {
  try {
    const authorization = 'eyJhbGciOiJIUzUxMiJ9.eyJhdXRoIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV0sInN1YiI6ImZpdmVndXlzXzZ1a2VlbUBnbWFpbC5jb20iLCJpYXQiOjE3MzE0MjE4MTMsImV4cCI6MzUzMTQyMTgxM30.Q225YzlXdWMr6-h0fVT1DAfDQDseJq76UgEPGBd1xQc6kUy_GpWpF1tqDg07gZWlKjeVOh5pROUoBTS3EShC4g';
    const p = 'a Maltese astronaut swimming in space';
    //prompt 자리

    const response = await axios.post(
      'http://localhost:8080/api/v1/ai/image/generate',
      { prompt: p },
      // { prompt: prompt },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authorization}`,
        },
      }
    );

    console.log(response.data);

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
      // return response.data.map((item, index) => ({
      //   id: (index + 1).toString(),
      //   src: item.url, // API 응답 구조에 따라 조정이 필요할 수 있습니다
      // }));
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error) {
    console.error('Error fetching image sources:', error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}
//이미지 초회차 생성
export async function reFetchImageSources(seed: string, prompt: string): Promise<ImageSource[] | { error: string }> {
  try {
    const authorization = 'eyJhbGciOiJIUzUxMiJ9.eyJhdXRoIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV0sInN1YiI6ImZpdmVndXlzXzZ1a2VlbUBnbWFpbC5jb20iLCJpYXQiOjE3MzE0MjE4MTMsImV4cCI6MzUzMTQyMTgxM30.Q225YzlXdWMr6-h0fVT1DAfDQDseJq76UgEPGBd1xQc6kUy_GpWpF1tqDg07gZWlKjeVOh5pROUoBTS3EShC4g';

    const response = await axios.get(
      `http://localhost:8080/api/v1/ai/image/${seed}`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${authorization}`,
        },
      }
    );

    console.log(response.data);

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error) {
    console.error('Error fetching image sources:', error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}
//이미지 재생성