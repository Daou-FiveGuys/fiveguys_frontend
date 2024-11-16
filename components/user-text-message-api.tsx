import axios, { AxiosError } from 'axios';

export const UserTextMessageApi = async (message: string) => {
  const url = 'http://localhost:8080/api/v1/ai/gpt/generate-text';
  const data = {
    text: message // 사용자 메시지를 사용합니다
  };
  const headers = {
    'accept': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJhdXRoIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV0sInN1YiI6ImZpdmVndXlzXzZ1a2VlbUBnbWFpbC5jb20iLCJpYXQiOjE3MzE0MjE4MTMsImV4cCI6MzUzMTQyMTgxM30.Q225YzlXdWMr6-h0fVT1DAfDQDseJq76UgEPGBd1xQc6kUy_GpWpF1tqDg07gZWlKjeVOh5pROUoBTS3EShC4g',
    'Content-Type': 'application/json'
  };

  let isValid = 0;

  try {
    const response = await axios.post(url, data, { headers });
    console.log('Response:', response.data);
    return {
      isValid: isValid === 0,
      data: typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
    };
  } catch (error) {
    isValid++;
    if (axios.isAxiosError(error)) {
      console.error('Error:', error.response?.data || error.message);
      return {
        isValid: isValid === 0,
        error: typeof error.response?.data === 'string' 
          ? error.response.data 
          : error.message || 'An error occurred'
      };
    } else {
      console.error('Unexpected error:', error);
      return {
        isValid: isValid === 0,
        error: 'An unexpected error occurred'
      };
    }
  }
};