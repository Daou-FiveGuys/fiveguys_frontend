"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import Handsontable from "handsontable";
import ExcelDownload from "./download";
import ExcelUpload from "./upload";
import { Folder2, Group2, Contact2 } from "./entity";
import { getFolder2Data, getContact2Data } from "./service";
import { transformContactsToExcelData } from "./transformExcel";
import { FolderSelect } from "./folderSelect";
import { GroupSelect } from "./groupSelect";

export default function Excel() {
    const initialData: string[][] = Array.from({ length: 50 }, () => Array(11).fill(""));
    const [data, setData] = useState<string[][]>(initialData);
    const [folder2Data, setFolder2Data] = useState<Folder2[]>([]);
    const [group2Data, setGroup2Data] = useState<Group2[]>([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);

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
                <FolderSelect
                    folders={folder2Data}
                    isLoading={isLoadingFolders}
                    onSelect={handleFolder2Select}
                />
                <GroupSelect
                    groups={group2Data}
                    isLoading={isLoadingGroups}
                    onSelect={handleGroup2Select}
                />
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
