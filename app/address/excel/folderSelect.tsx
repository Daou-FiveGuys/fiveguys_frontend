import React from "react";
import { Folder2 } from "./entity";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "components/ui/select";

interface FolderSelectProps {
    folders: Folder2[];
    isLoading: boolean;
    onSelect: (folderId: Number) => void;
}

export const FolderSelect: React.FC<FolderSelectProps> = ({
    folders,
    isLoading,
    onSelect,
}) => {
    return (
        <Select onValueChange={(value) => onSelect(Number(value))}>
            <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="폴더 선택" />
            </SelectTrigger>
            <SelectContent>
                {isLoading ? (
                    <SelectItem value="loading" disabled>
                        로딩 중...
                    </SelectItem>
                ) : folders.length > 0 ? (
                    folders.map((folder2) => (
                        <SelectItem
                            key={folder2.folderId}
                            value={folder2.folderId.toString()}
                        >
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
    );
};
