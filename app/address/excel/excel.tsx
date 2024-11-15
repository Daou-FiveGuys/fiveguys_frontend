"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import Handsontable from "handsontable";
import ExcelDownloadButton from "./download";
import FileUpload from "./upload";
import { Contact, Groups } from "./types";
import { getGroupData } from "./getGroups";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "components/ui/select";

export default function Excel() {
  const initialData: string[][] = Array.from({ length: 50 }, () =>
    Array(11).fill("")
  );

  const [data, setData] = useState<string[][]>(initialData);
  const [groupData, setGroupData] = useState<Groups[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const contactTableRef = useRef<Handsontable | null>(null);

  useEffect(() => {
    registerAllModules();

    const container = document.getElementById("hot-app");
    if (container && !contactTableRef.current) {
      contactTableRef.current = new Handsontable(container, {
        data: data,
        rowHeaders: true,
        colHeaders: [
          "그룹명",
          "이름",
          "휴대폰",
          "[*1*]",
          "[*2*]",
          "[*3*]",
          "[*4*]",
          "[*5*]",
          "[*6*]",
          "[*7*]",
          "[*8*]",
        ],
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

    fetchGroupData("userId");

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

  const fetchGroupData = async (userId: string) => {
    setIsLoading(true);
    const data = await getGroupData(userId);
    setGroupData(data);
    setIsLoading(false);
  };

  const handleFileData = (jsonData: string[][]) => {
    setData(jsonData);
  };

  // 사용자가 그룹을 선택할 때 호출되는 비동기 함수
  const handleGroupSelect = async (selectedGroupId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/contact/id/${selectedGroupId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("API 요청 실패:", response.status, response.statusText);
        throw new Error(
          `API 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const contacts: Contact[] = Array.isArray(result.data) ? result.data : [];

      // Contact 데이터를 엑셀 형식으로 변환
      const updatedData: string[][] = contacts.map((contact) => [
        contact.groups.groupsName,
        contact.name.toString(),
        contact.telNum.toString(),
        "", "", "", "", "", "", "", ""
      ]);

      // 빈 행을 추가해 데이터 길이 고정
      while (updatedData.length < 50) {
        updatedData.push(Array(11).fill(""));
      }

      setData(updatedData); // 변환된 데이터를 Handsontable에 반영
    } catch (error) {
      console.error("데이터 로드 오류:", error);
    }
  };

  const loggingClick = () => {
    console.log(data);
  };

  return (
    <main>
      <div>
        {isLoading ? (
          <p>그룹 데이터를 불러오는 중...</p>
        ) : groupData.length > 0 ? (
          <Select
            onValueChange={(value) =>
              handleGroupSelect(value).then(() =>
                console.log("Contacts loaded")
              )
            }
          >
            {/* onValueChange로 선택된 값 전달 */}
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent className="z-50">
              {groupData.map((group) => (
                <SelectItem
                  key={group.groupsId}
                  value={group.groupsId.toString()}
                >
                  {group.groupsName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p>데이터가 없습니다.</p>
        )}
      </div>{" "}
      <br /> <br />
      <div id="hot-app" className="relative z-10" /> <br /> <br />
      <FileUpload onFileUpload={handleFileData} /> <br /> <br />{" "}
      {/* 파일 업로드 컴포넌트 사용 */}
      <ExcelDownloadButton tableRef={contactTableRef} /> <br /> <br />
      <button onClick={loggingClick}>
        로그에 테이블 객체 상태 출력하기 (이후 저장하기로 변경)
      </button>{" "}
      <br /> <br />
    </main>
  );
}
