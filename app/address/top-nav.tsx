import Link from "next/dist/client/link";

export default function TopNav() {
    return (
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="space-x-4">
                {/* <Link href="http://hansung-fiveguys.duckdns.org/address" className= {`hover:text-gray`} > */}
                <Link href="http://localhost:3000/address" className= {`hover:text-gray`} >
                    그룹 관리 
                </Link>

                {/* <Link href="http://hansung-fiveguys.duckdns.org/excel" className={`hover:text-gray`}> */}
                <Link href="http://localhost:3000/address/excel" className= {`hover:text-gray`} >
                    주소록
                </Link>
            </div>
          </nav>
    )
}