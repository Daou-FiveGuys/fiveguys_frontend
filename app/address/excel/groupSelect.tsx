import React from "react";
import { Group2 } from "./entity";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "components/ui/select";

interface GroupSelectProps {
    groups: Group2[];
    isLoading: boolean;
    onSelect: (groupId: string) => void;
}

export const GroupSelect: React.FC<GroupSelectProps> = ({
    groups,
    isLoading,
    onSelect,
}) => {
    return (
        <Select onValueChange={(value) => onSelect(value)}>
            <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="그룹 선택" />
            </SelectTrigger>
            <SelectContent>
                {isLoading ? (
                    <SelectItem value="loading" disabled>
                        로딩 중...
                    </SelectItem>
                ) : groups.length > 0 ? (
                    groups.map((group2) => (
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
    );
};
