export const EmailForm = () => {
  return (
    <div className='flex items-center bg-white rounded-full max-w-md mx-auto overflow-hidden'>
      <input type='email' placeholder='Enter Your E-mail' className='flex-1 px-5 py-3 outline-none text-gray-700' />
      <button className='bg-blue-600 text-white px-6 py-2 rounded-full mr-2'>SEND</button>
    </div>
  )
}
