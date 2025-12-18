import { RouterProvider } from 'react-router-dom'
import { router } from './configs/routers'

export default function App() {
  return <RouterProvider router={router} />
}
