import Excel from './excel'
import TopNav from '../top-nav'

export default function Home() {
    return (
        <main className="container mx-auto p-4">
            <TopNav/>
            <Excel />
        </main>
    )
}