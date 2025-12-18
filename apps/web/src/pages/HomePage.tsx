import { LandingLayout } from '../components/templates/LandingLayout'
import { HeaderContent } from '../components/molecules/home/Content'

export const HomePage: React.FC = () => {
  return (
    <LandingLayout>
      {/* Hero sẽ gắn ở đây */}
      <HeaderContent />
    </LandingLayout>
  )
}

// export default HomePage
