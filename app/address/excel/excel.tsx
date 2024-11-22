"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import Handsontable from "handsontable";
import ExcelDownload from "./download";
import ExcelUpload from "./upload";
import { Folder2, Group2, Contact2 } from "./entity";
import { getFolder2Data, getContact2Data, patchGroup2Data } from "./service";
import { transformContactsToExcelData } from "./transformExcel";
import { FolderSelect } from "./folderSelect";
import { GroupSelect } from "./groupSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Excel() {
    const initialData: string[][] = Array.from({ length: 50 }, () => Array(10).fill(""));
    const [data, setData] = useState<string[][]>(initialData);
    const [folder2Data, setFolder2Data] = useState<Folder2[]>([]);
    const [group2Data, setGroup2Data] = useState<Group2[]>([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<Number | null>(null);

    const contactTableRef = useRef<Handsontable | null>(null);

    useEffect(() => {
        registerAllModules();
        const container = document.getElementById("hot-app");
        if (container && !contactTableRef.current) {
            contactTableRef.current = new Handsontable(container, {
                data: data,
                rowHeaders: true,
                colHeaders: ["이름", "전화번호", "[*1*]", "[*2*]", "[*3*]", "[*4*]", "[*5*]", "[*6*]", "[*7*]", "[*8*]"],
                height: "calc(18 * 23px + 30px)", // 18 rows * 23px (default row height) + 30px for the header
                width: "100%",
                colWidths: [100, 120, 80, 80, 80, 80, 80, 80, 80, 80], // 각 열의 너비를 조정
                licenseKey: "non-commercial-and-evaluation",
                stretchH: 'all',
                autoColumnSize: true,
                autoRowSize: true,
                contextMenu: true,
                manualColumnResize: true,
                manualRowResize: true,
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
            const folders = await getFolder2Data();
            setFolder2Data(folders);
        } catch (error) {
            console.error("폴더 데이터 로드 오류:", error);
        } finally {
            setIsLoadingFolders(false);
        }
    };

    const handleFolder2Select = async (folderId: Number) => {
        setIsLoadingGroups(true);
        try {
            const folder = folder2Data.find((f) => f.folderId === folderId);
            if (folder && folder.group2s) {
                setGroup2Data(folder.group2s);
            } else {
                setGroup2Data([]);
            }
        } catch (error) {
            console.error("그룹 데이터 로드 오류:", error);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    const handleGroup2Select = async (groupId: Number) => {
        try {
            const contacts = await getContact2Data(groupId);
            setSelectedGroupId(groupId);
            const transformedData = transformContactsToExcelData(contacts);
            setData(transformedData);
        } catch (error) {
            console.error("연락처 데이터 로드 오류:", error);
        }
    };

    const handleFileData = (jsonData: string[][]) => {
        setData(jsonData);
    };

    const handleSaveData = async () => {
        if (!selectedGroupId) {
            alert("그룹을 먼저 선택하세요.");
            return;
        }
    
        const contactList: Contact2[] = data
            .filter((row) => row[0].trim() !== "")
            .map((row) => ({
                contactId: 0,
                name: row[0],
                telNum: row[1],
                one: row[2],
                two: row[3],
                three: row[4],
                four: row[5],
                five: row[6],
                six: row[7],
                seven: row[8],
                eight: row[9],
                group2: {
                    groupsId: selectedGroupId,
                    name: group2Data.find((group) => group.groupsId === selectedGroupId)?.name || "",
                    folder2: {
                        folderId: folder2Data.find((folder) =>
                            folder.group2s.some((group) => group.groupsId === selectedGroupId)
                        )?.folderId || 0,
                        name: folder2Data.find((folder) =>
                            folder.group2s.some((group) => group.groupsId === selectedGroupId)
                        )?.name || "",
                    },
                },
            }));
    
        try {
            const updatedContacts = await patchGroup2Data(selectedGroupId, contactList);
            alert("데이터 저장이 완료되었습니다.");
            console.log("Updated Contacts:", updatedContacts);
        } catch (error) {
            console.error("데이터 저장 오류:", error);
            alert("데이터 저장에 실패했습니다.");
        }
    };    

    return (
        <Card className="w-full mx-auto">
            <CardHeader>
                <CardTitle>엑셀 데이터 관리</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-4 mb-4 z-20">
                    <FolderSelect
                        folders={folder2Data}
                        isLoading={isLoadingFolders}
                        onSelect={handleFolder2Select}
                    />
                    <GroupSelect
                        groups={group2Data}
                        isLoading={isLoadingGroups}
                        onSelect={(value) => handleGroup2Select(Number(value))}
                    />
                </div>
                <div id="hot-app" className="mb-4 overflow-hidden z-10" />
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <ExcelUpload onFileUpload={handleFileData} />
                    <div className="flex gap-2">
                        <ExcelDownload tableRef={contactTableRef} />
                        <Button onClick={handleSaveData}>저장하기</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}