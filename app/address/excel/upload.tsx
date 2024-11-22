"use client"

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileIcon, UploadIcon } from "lucide-react";

interface ExcelUploadProps {
    onFileUpload: (data: string[][]) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onFileUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError(null);

        if (file) {
            if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
                setError("올바른 파일 형식이 아닙니다. xlsx, xls, csv 파일만 업로드 가능합니다.");
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });

                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    let jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    jsonData = jsonData.map(row => {
                        if (row.length > 11) {
                            return row.slice(0, 11);
                        } else if (row.length < 11) {
                            return [...row, ...Array(11 - row.length).fill("")];
                        }
                        return row;
                    });

                    if (jsonData.length < 50) {
                        const rowsToAdd = 50 - jsonData.length;
                        jsonData = [...jsonData, ...Array(rowsToAdd).fill(Array(11).fill(""))];
                    } else if (jsonData.length > 50) {
                        jsonData = jsonData.slice(0, 50);
                    }

                    onFileUpload(jsonData);
                } catch (error) {
                    console.error("파일 처리 중 오류 발생:", error);
                    setError("파일 처리 중 오류가 발생했습니다. 파일을 확인해 주세요.");
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center space-x-2">
                <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                />
                <Button
                    variant="outline"
                    className="bg-transparent text-black hover:bg-gray-100"
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <UploadIcon className="w-4 h-4 mr-2" />
                    파일선택
                </Button>
                {selectedFile && (
                    <div className="flex items-center text-sm text-gray-600">
                        <FileIcon className="w-4 h-4 mr-2" />
                        <span>{selectedFile.name}</span>
                        <span className="ml-2">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default ExcelUpload;