import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'TokenForge',
  projectId: 'sejhfjas',
  chains: [sepolia],
});