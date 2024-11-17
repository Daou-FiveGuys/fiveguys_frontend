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

    // 데이터 저장 함수
    const handleSaveData = async () => {
        if (!selectedGroupId) {
            alert("그룹을 먼저 선택하세요.");
            return;
        }
    
        // 데이터 배열을 Contact2 객체 리스트로 변환
        const contactList: Contact2[] = data
            .filter((row) => row[0].trim() !== "") // 이름이 있는 행만 변환
            .map((row) => ({
                contactId: 0, // 새로운 데이터는 ID를 0으로 설정 (서버에서 생성)
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
        <main>
            <div className="flex space-x-4">
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
            <br />
            <div id="hot-app" className="relative z-10" />
            <br />
            <ExcelUpload onFileUpload={handleFileData} />
            <br />
            <ExcelDownload tableRef={contactTableRef} />
            <br />
            <button onClick={handleSaveData}> 저장하기 </button>
        </main>
    );
}
