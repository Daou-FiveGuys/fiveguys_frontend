import { Contact2 } from "./entity";

// Contact2 데이터를 엑셀 형식의 2차원 배열로 변환
export const transformContactsToExcelData = (contacts: Contact2[]): string[][] => {
    const transformedData = contacts.map((contact) => [
        contact.name,
        contact.telNum,
        contact.one,
        contact.two,
        contact.three,
        contact.four,
        contact.five,
        contact.six,
        contact.seven,
        contact.eight,
    ]);

    // 50행 고정
    while (transformedData.length < 50) {
        transformedData.push(Array(11).fill(""));
    }

    return transformedData;
};
