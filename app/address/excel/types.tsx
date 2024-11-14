export interface Groups {
    groupsId: number;
    userId: string;
    groupsName: string;
    parent: Groups | null;
}

export interface CommonResponse<T> {
    code: number;
    message: string;
    data: T;
}
