// chèn background

interface ImageBackgroundProps {
  src: string
  overlay?: boolean
}

export const ImageBackground = ({ src, overlay = false }: ImageBackgroundProps) => {
  return (
    <div className='absolute inset-0 -z-10 overflow-hidden'>
      <div
        className='absolute inset-0 bg-no-repeat bg-cover bg-center'
        style={{
          backgroundImage: `url(${src})`
        }}
      />

      {overlay && <div className='absolute inset-0 bg-black/30' />}
    </div>
  )
}
