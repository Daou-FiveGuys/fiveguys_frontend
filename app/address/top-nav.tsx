"use client"

import Link from "next/dist/client/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
    const pathname = usePathname(); // 현재 경로를 가져옴

    return (
        <nav className="flex flex-row justify-start items-center max-w-7xl mx-auto pl-0">
            {/* 그룹 관리 링크 */}
            <div className="p-2">
                <Link 
                    href="http://localhost:3000/address" 
                    className={`${
                        pathname === "/address" 
                            ? "bg-blue-500 hover:bg-blue-600" 
                            : "bg-blue-300 hover:bg-blue-400"
                    } text-white rounded-lg p-2 shadow-sm transition-colors duration-300`}
                >
                    그룹 관리
                </Link>
            </div>

            {/* 주소록 링크 */}
            <div className="p-2">
                <Link 
                    href="http://localhost:3000/address/excel" 
                    className={`${
                        pathname === "/address/excel" 
                            ? "bg-blue-500 hover:bg-blue-600" 
                            : "bg-blue-300 hover:bg-blue-400"
                    } text-white rounded-lg p-2 shadow-sm transition-colors duration-300`}
                >
                    주소록
                </Link>
            </div>
        </nav>
    );
}
