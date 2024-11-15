export interface CommonResponse<T> {
    code: number;
    message: string;
    data: T;
}

export interface Folder2 {
    folderId: number;
    name: string;
    group2s: Group2[];
}

export interface Group2 {
    groupsId: number;
    name: string;
    contact2s: Contact2[];
}

export interface Contact2 {
    contactId: number;
    name: string;
    telNum: string;
    one: string;
    two: string;
    three: string;
    four: string;
    five: string;
    six: string;
    seven: string;
    eight: string;
}
