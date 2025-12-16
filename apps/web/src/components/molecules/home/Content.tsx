import { EmailForm } from './EmailForm'

export const HeaderContent = () => {
  return (
    <section className='relative text-center text-white py-32'>
      <p className='tracking-widest text-sm text-white/70 mb-4'>LOREM IPSUM DOLOR</p>

      <h1 className='text-6xl font-bold mb-6'>E-Commerce</h1>

      <p className='max-w-xl mx-auto text-white/80 mb-10'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut.
      </p>

      <EmailForm />
    </section>
  )
}
