/**
   * 뿌리오 주소록 엔티티
   */
export type Contact2 = {
    contactId: number;
    name: string;
    telNum: string;
    var1: string;
    var2: string;
    var3: string;
    var4: string;
    var5: string;
    var6: string;
    var7: string;
    var8: string;
  };
  
  /**
   * 뿌리오 그룹 엔티티
   */
  export type Group2 = {
    groupsId: number;
    name: string;
    contact2s: Contact2[];
  };
  

  /**
   * 뿌리오 폴더 엔티티
   * ※ 원본은 여기에 User 속성이 존재한다.
   */
  export type Folder2 = {
    folderId: number;
    name: string;
    group2s: Group2[];
  };
  
  /**
   * 뿌리오 검색 결과를 보관하는 클래스
   */
  export type SearchResult = {
    folder2: Folder2;
    group2: Group2;
    contact2s: Contact2[];
};
