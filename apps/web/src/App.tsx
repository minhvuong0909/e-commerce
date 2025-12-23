import { RouterProvider } from 'react-router-dom'
import { router } from './configs/routers'
import { ToastContainer } from 'react-toastify'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}
