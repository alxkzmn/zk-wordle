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
      <div className="ml-3 dark:text-white">
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
        <button
          className="dark:text-white"
          onClick={() => setConnectionModalOpen(true)}
        >
          Connect Wallet
        </button>
      )}
      <ConnectWalletModal
        isOpen={isConnectionModalOpen}
        handleClose={() => {
          if (isConnected) setConnectionModalOpen(false)
        }}
      />
    </div>
  )
}
