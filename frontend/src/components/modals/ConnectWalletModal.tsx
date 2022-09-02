import { useConnect } from 'wagmi'
import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const ConnectWalletModal = ({ isOpen, handleClose }: Props) => {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()

  return (
    <BaseModal title="Connect Wallet" isOpen={isOpen} handleClose={handleClose}>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </BaseModal>
  )
}
