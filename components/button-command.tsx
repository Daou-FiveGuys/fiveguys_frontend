import {Button, ButtonProps} from "@/components/ui/button";
import {Dispatch, SetStateAction} from "react";

interface ButtonCommand extends ButtonProps {
    setInput: Dispatch<SetStateAction<string>>
    command: string
}

/**
 * 버튼 컴포넌트를 사용해 입력창에 명령어를 추가하는 컴포넌트
 * 
 * @param setInput 명령어를 치는 프롬프트 입력창에 set함수
 * @param command 입력할 명령어
 * @param props ButtonProps
 * @constructor
 */
export function ButtonCommand({setInput, command, ...props}: ButtonCommand) {
    return (
        <Button variant="outline" size="sm" className="bg-white text-black rounded-full hover:bg-gray-100"
                onClick={()=> setInput((prevState: string) => prevState + command)}>
            {command}
        </Button>
    )
}