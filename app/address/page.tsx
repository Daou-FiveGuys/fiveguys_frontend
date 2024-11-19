import AddressBook from './address-book'
import TopNav from './top-nav'

export default function Home() {
    return (
        <main className="container mx-auto p-4">
            <TopNav/>
            <AddressBook/>
        </main>
    )
}