import { Contact, CommonResponse } from "./entity";

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
