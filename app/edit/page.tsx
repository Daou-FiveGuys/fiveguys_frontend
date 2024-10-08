import { auth } from '@/auth'
import ImageEditorForm from '@/components/image-editor'
import { Session } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function EditPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  } 

  return (
    <main className="flex flex-col p-4">
      <ImageEditorForm />
    </main>
  )
}
