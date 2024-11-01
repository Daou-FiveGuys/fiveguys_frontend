import React, { Dispatch, SetStateAction, forwardRef } from 'react';
import {Button, ButtonProps} from "@/components/ui/button";

interface ButtonCommandProps extends ButtonProps {
    setInput: Dispatch<SetStateAction<string>>;
    command: string;
}

/**
 * 버튼 컴포넌트를 사용해 입력창에 명령어를 추가하는 컴포넌트
 *
 * @param setInput 명령어를 치는 프롬프트 입력창에 set함수
 * @param command 입력할 명령어
 * @param ref
 * @param props ButtonProps
 * @constructor
 */
export const ButtonCommand = forwardRef<HTMLTextAreaElement, ButtonCommandProps>(
    ({ setInput, command, ...props }, ref) => {

        return (
            <Button
                variant="outline"
                size="sm"
                className="bg-white text-black rounded-full hover:bg-gray-100"
                onClick={() => {
                    setInput((prevState: string) => prevState + command);
                    (ref as React.RefObject<HTMLTextAreaElement>).current?.focus(); // ref가 null이 아닐 때 focus
                }}
                {...props}
            >
                {command}
            </Button>
        );
    }
);
