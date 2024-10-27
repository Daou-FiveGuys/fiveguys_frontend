// import { useRouter } from 'next/router'
// import Image from 'next/image'
// import ImageEditorForm from '@/components/image-editor'

// export default function ImageEditorPage(imageId:ImageEditorFormProps) {
//   const router = useRouter()
//   const { image } = router.query

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">이미지 편집</h1>
//       {image && (
//         <div className="mb-4">
//           <Image 
//             src={image as string} 
//             alt="편집할 이미지" 
//             width={500} 
//             height={300} 
//             layout="responsive"
//           />
//         </div>
//       )}
//       <ImageEditorForm selectedImage={image as string} />
//     </div>
//   )
// }