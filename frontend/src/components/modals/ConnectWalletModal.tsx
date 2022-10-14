import { useConnect } from 'wagmi'
import {
  CONNECT_WALLET_MSG,
  CONNECT_WALLET_TITLE,
} from '../../constants/strings'
import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const ConnectWalletModal = ({ isOpen, handleClose }: Props) => {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()

  return (
    <BaseModal
      title={CONNECT_WALLET_TITLE}
      isOpen={isOpen}
      handleClose={handleClose}
      isCloseable={false}
    >
      <div className="dark:text-white">{CONNECT_WALLET_MSG}</div>
      {connectors.map((connector) => (
        <button
          type="button"
          className="mt-2 w-full rounded-md border shadow-sm px-4 py-2 text-base font-medium dark:text-white hover:ring-indigo-500 hover:outline-none hover:ring-2 hover:ring-offset-2 sm:text-sm"
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
