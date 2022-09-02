import { useEffect, useState } from 'react'
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { ConnectWalletModal } from '../modals/ConnectWalletModal'

export function Profile() {
  const [isConnectionModalOpen, setConnectionModalOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address })
  const { disconnect } = useDisconnect()

  useEffect(() => {
    if (!isConnected) {
      setConnectionModalOpen(true)
    }
  }, [isConnected])

  if (isConnected) {
    return (
      <div>
        {ensName && <img src={ensAvatar ?? ''} alt="" />}
        <div>
          {ensName
            ? `${ensName} (${
                address?.slice(0, 4) + '...' + address?.slice(-2)
              })`
            : address?.slice(0, 4) + '...' + address?.slice(-2)}
        </div>
        <button
          onClick={() => {
            disconnect()
          }}
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div>
      {!isConnected && (
        <button onClick={() => setConnectionModalOpen(true)}>
          Connect Wallet
        </button>
      )}
      <ConnectWalletModal
        isOpen={isConnectionModalOpen}
        handleClose={() => setConnectionModalOpen(false)}
      />
    </div>
  )
}
