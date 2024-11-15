"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import Handsontable from "handsontable";
import ExcelDownload from "./download";
import ExcelUpload from "./upload";
import { Folder2, Group2, Contact2 } from "./entity";
import { getFolder2Data, getGroup2Data, getContact2Data } from "./service";
import { transformContactsToExcelData } from "./transformExcel";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "components/ui/select";

export default function Excel() {
    const initialData: string[][] = Array.from({ length: 50 }, () => Array(11).fill(""));
    const [data, setData] = useState<string[][]>(initialData);
    const [folder2Data, setFolder2Data] = useState<Folder2[]>([]);
    const [group2Data, setGroup2Data] = useState<Group2[]>([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<Number | null>(null);

    const contactTableRef = useRef<Handsontable | null>(null);

    useEffect(() => {
        registerAllModules();
        const container = document.getElementById("hot-app");
        if (container && !contactTableRef.current) {
            contactTableRef.current = new Handsontable(container, {
                data: data,
                rowHeaders: true,
                colHeaders: ["이름", "전화번호", "[*1*]", "[*2*]", "[*3*]", "[*4*]", "[*5*]", "[*6*]", "[*7*]", "[*8*]"],
                height: "300",
                rowHeights: 20,
                className: "htCenter htMiddle",
                autoWrapRow: true,
                autoWrapCol: true,
                width: "auto",
                colWidths: 110,
                licenseKey: "non-commercial-and-evaluation",
            });
        }

        fetchFolder2Data(1);

        return () => {
            if (contactTableRef.current && !contactTableRef.current.isDestroyed) {
                contactTableRef.current.destroy();
                contactTableRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (contactTableRef.current) {
            contactTableRef.current.loadData(data);
        }
    }, [data]);

    const fetchFolder2Data = async (userId: number) => {
        setIsLoadingFolders(true);
        try {
            const folders = await getFolder2Data(userId);
            console.log("Fetched Folder2 Data:", folders);
            setFolder2Data(folders);
        } catch (error) {
            console.error("폴더 데이터 로드 오류:", error);
        } finally {
            setIsLoadingFolders(false);
        }
    };

    const handleFolder2Select = async (folderId: Number) => {
        setSelectedFolderId(folderId);
        setIsLoadingGroups(true);
        try {
            const folder = folder2Data.find((f) => f.folderId === folderId);
            if (folder && folder.group2s) {
                console.log("Fetched Group2 Data from Folder:", folder.group2s);
                setGroup2Data(folder.group2s);
            } else {
                console.log("No groups found for the selected folder.");
                setGroup2Data([]);
            }
        } catch (error) {
            console.error("그룹 데이터 로드 오류:", error);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    const handleGroup2Select = async (groupId: string) => {
        try {
            const contacts = await getContact2Data(groupId);
            console.log("Fetched Contacts for Group:", contacts);
            const transformedData = transformContactsToExcelData(contacts);
            setData(transformedData);
        } catch (error) {
            console.error("연락처 데이터 로드 오류:", error);
        }
    };

    const handleFileData = (jsonData: string[][]) => {
        setData(jsonData);
    };

    return (
        <main>
            <div className="flex space-x-4">
                <div>
                    <Select onValueChange={(value) => handleFolder2Select(Number(value))}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="폴더 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingFolders ? (
                                <SelectItem value="loading" disabled>
                                    로딩 중...
                                </SelectItem>
                            ) : folder2Data.length > 0 ? (
                                folder2Data.map((folder2) => (
                                    <SelectItem key={folder2.folderId} value={folder2.folderId.toString()}>
                                        {folder2.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="empty" disabled>
                                    선택 가능한 폴더가 없습니다
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Select onValueChange={(value) => handleGroup2Select(value)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="그룹 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingGroups ? (
                                <SelectItem value="loading" disabled>
                                    로딩 중...
                                </SelectItem>
                            ) : group2Data.length > 0 ? (
                                group2Data.map((group2) => (
                                    <SelectItem key={group2.groupsId} value={group2.groupsId.toString()}>
                                        {group2.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="empty" disabled>
                                    선택 가능한 그룹이 없습니다
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <br />
            <div id="hot-app" className="relative z-10" />
            <br />
            <ExcelUpload onFileUpload={handleFileData} />
            <br />
            <ExcelDownload tableRef={contactTableRef} />
        </main>
    );
}
