import axios from 'axios';

interface ImageSource {
  id: string;
  src: string;
  seed: string;
}

export async function fetchImageSources(): Promise<ImageSource[] | "error"> {
  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/photos");// 실험용 'https://codingapple1.github.io/shop/data2.json'

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