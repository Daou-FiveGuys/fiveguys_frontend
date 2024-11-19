import Link from 'next/dist/client/link'
import AddressBookModal from './select-contact-modal'

export default function Home() {
    return (
        <main className="container mx-auto p-4">
            <AddressBookModal/>
        </main>
    )
}