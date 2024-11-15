import { User } from "next-auth";

export interface CommonResponse<T> {
    code: number;
    message: string;
    data: T;
}

export interface Groups {
    groupsId: number;
    userId: string;
    groupsName: string;
    parent: Groups | null;
}

export interface Contact {
    contactId: number;
    groups: Groups;
    user: User;
    name: String;
    telNum: String;
}