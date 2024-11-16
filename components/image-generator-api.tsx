import axios from 'axios';

interface ImageSource {
  id: string;
  src: string;
  seed: string;
}

export async function fetchImageSources(): Promise<ImageSource[] | "error"> {
  try {
    const authorization = 'eyJhbGciOiJIUzUxMiJ9.eyJhdXRoIjpbeyJhdXRob3JpdHkiOiJST0xFX1VTRVIifV0sInN1YiI6Imdvb2dsZV8xMDIwOTkwOTE5ODQwNDc5MTI2OTYiLCJpYXQiOjE3MzE2Njg4NTgsImV4cCI6MTczMTY3MDY1OH0.xf80zKsAcDkVO6Lry1DnLzH10ZHPX9MfdyJZ-URPdWE16ufQBp1vEi7RsGrfw5vQSQ4A9RfIY0LmduspW731Fw';

    const imagePromptDTO = {
      prompt: "날개가 달린 헤드폰", // 생성할 이미지의 프롬프트
    };

    const response = await axios.post(
      'http://localhost:8080/api/v1/ai/image/generate', // API URL
      imagePromptDTO, // 요청 바디
      {
        headers: {
          Authorization: `Bearer ${authorization}`, // 인증 헤더
          'Content-Type': 'application/json', // Content-Type 설정
        },
      }
    );
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map((item, index) => ({
        id: (index + 1).toString(),
        src: item.url // API 응답 구조에 따라 이 부분을 조정해야 할 수 있습니다.
        ,seed: item.seed
      }));
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error) {
    console.error('Error fetching image sources:', error);
    return "error";
  }
}
export async function reFetchImageSources(seed:string): Promise<ImageSource[] | "error"> {
  console.log(seed);
  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/photos");// "https://jsonplaceholder.typicode.com/photos" 실험용 'https://codingapple1.github.io/shop/data2.json'

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map((item, index) => ({
        id: (index + 1).toString(),
        src: item.url // API 응답 구조에 따라 이 부분을 조정해야 할 수 있습니다.
        ,seed: item.seed
      }));
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error) {
    console.error('Error fetching image sources:', error);
    return "error";
  }
}

  //   const userData = {
  //     name: 'John Doe',
  //     email: 'john@example.com',
  //     password: 'securePassword123',
  //   };
  
  //   try {
  //     const response = await axios.post('https://example.com/api/user', userData, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //     console.log('Server response:', response.data);
  //   } catch (error) {
  //     console.error('Error sending user data:', error);
  //   }
  // }