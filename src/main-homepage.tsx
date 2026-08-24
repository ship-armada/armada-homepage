import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/theme-overrides.css'
import { initFixedLightTheme } from '@/utils/theme'
import { mountRoot } from '@/mountRoot'
import { Homepage } from './pages/Homepage'

initFixedLightTheme()

mountRoot(<Homepage heroScrollExit />)
