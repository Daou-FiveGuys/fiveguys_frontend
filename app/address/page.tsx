import AddressBook from '@/components/address-book'
import Excel from './excel/excel'

export default function Home() {
    return (
        <main className="container mx-auto p-4">
            <AddressBook />
            <Excel />
        </main>
    )
}