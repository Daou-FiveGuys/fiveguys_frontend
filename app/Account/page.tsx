import { auth } from '@/auth'
import AccountManagementForm from '@/components/account-management'
import { Session } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  } 

  return (
    <main className="flex flex-col p-4">
      <AccountManagementForm />
    </main>
  )
}
