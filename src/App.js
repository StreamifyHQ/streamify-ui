import {
  Container,
  Box,
  Button,
  Text,
  FormControl,
  Input,
  NumberInput,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { connect } from 'get-starknet'
import { Contract } from 'starknet'
import { toHex, hexToDecimalString } from 'starknet/dist/utils/number'
import { BigNumber } from 'ethers'

import { addressTruncator } from './utils'
import tokenABI from './tokenABI.json'
import { BN } from 'bn.js'

const ABI = tokenABI

const CONTRACT_ADDRESS =
  '0x063e8ed5ab3b234f4ee65ab06f04ee134b72422b345715f92daa3cf81726f054'

// const CONTRACT_ADDRESS =
//   '0x01e593b414650cd3a3c1c17fa77f33a5a10ab9e845ffe2578f9862264953b1a2'

const DECIMAL = BigNumber.from('1000000000000000000')
const DECIMAL_USING_BNJS = new BN('1000000000000000000')
const ZERO_MUL_DECIMAL_IN_BNJS = new BN(0).mul(DECIMAL_USING_BNJS)

function App() {
  const [mintSubmitButtonIsLoading, setMintSubmitButtonIsLoading] = useState(
    false,
  )
  const [
    startStreamSubmitButtonIsLoading,
    setStartStreamSubmitButtonIsLoading,
  ] = useState(false)
  const [mintAmount, setMintAmount] = useState(0)
  const [receiverAddress, setReceiverAddress] = useState('')
  const [receiverAmount, setReceiverAmount] = useState(0)
  const [amountPerSecond, setAmountPerSound] = useState(0)
  const [mintformValidity, setMintformValidityy] = useState(false)
  const [streamformValidity, setStreamformValidity] = useState(false)
  const [balance, setBalance] = useState(0)
  const [contract, setContract] = useState('')
  const [account, setAccount] = useState('')
  const [address, setAddress] = useState('')
  const [trimmedAddress, setTrimmedAddress] = useState('')
  const [testAddress, setTestAddress] = useState(
    '0x057bfbd1a0e0298fc14d47c5c305c1a4c3a865d16caffa9158c540bbde2d31e4',
  )
  const [testAddressBalance, setTestAddressBalance] = useState(0)

  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const updateTokenInfo = async () => {
      if (contract !== '') {
        const balance = await getTokenBalance(address)
        setBalance(balance)
      }
    }
    updateTokenInfo()
  }, [contract, account])

  useEffect(() => {
    if (account !== '') {
      const contract = new Contract(ABI, CONTRACT_ADDRESS, account)
      setContract(contract)
    }
  }, [account])

  useEffect(() => {
    if (
      receiverAmount > 0 &&
      amountPerSecond > 0 &&
      receiverAddress !== '' &&
      connected
    ) {
      setStreamformValidity(true)
    } else {
      setStreamformValidity(false)
    }
  }, [receiverAmount, amountPerSecond, receiverAddress, connected])

  useEffect(() => {
    if (mintAmount > 0 && connected) {
      setMintformValidityy(true)
    } else {
      setMintformValidityy(false)
    }
  }, [mintAmount, connected])

  const getTokenBalance = async (_account) => {
    try {
      const balanceAsUINT256_Struct = await contract.balanceOf(_account)
      const balance = balanceAsUINT256_Struct.balance.low
      const balanceAsHex = toHex(balance)
      const balanceAsString = hexToDecimalString(balanceAsHex)
      const balanceAsBigNumber = BigNumber.from(balanceAsString)
      const balanceAsInt = balanceAsBigNumber.div(DECIMAL).toNumber()
      return balanceAsInt
    } catch (err) {
      console.error(err)
      return 0
    }
  }

  const connectWallet = async () => {
    try {
      const starknet = await connect()
      if (!starknet.isConnected) {
        await starknet.enable({ starknetVersion: 'v4' })
        setAccount(starknet.account)
        setAddress(starknet.account.address)
        setConnected(true)
        const truncatedAddress = addressTruncator(starknet.account.address)
        setTrimmedAddress(truncatedAddress)
      } else {
        setAccount(starknet.account)
        setAddress(starknet.account.address)
        setConnected(true)
        const truncatedAddress = addressTruncator(starknet.account.address)
        setTrimmedAddress(truncatedAddress)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const handleReceiverAddress = (event) => {
    const address = event.target.value
    if (address.length === 66) {
      setReceiverAddress(address)
    } else {
      setReceiverAddress('')
    }
  }

  const handleRecieverAmount = (value) => {
    const amount = parseInt(value)
    if (amount > 0) {
      setReceiverAmount(amount)
    } else {
      setReceiverAmount(0)
    }
  }

  const handleAmountPerSecond = (value) => {
    const amount = parseInt(value)
    if (amount > 0) {
      setAmountPerSound(amount)
    } else {
      setAmountPerSound(0)
    }
  }

  const handleStartStream = async () => {
    setStartStreamSubmitButtonIsLoading(true)
    try {
      const _amountPerSecond = new BN(amountPerSecond)
      const _receiverAmount = new BN(receiverAmount)
      const res = await contract.start_stream(
        receiverAddress,
        [_amountPerSecond.mul(DECIMAL_USING_BNJS), ZERO_MUL_DECIMAL_IN_BNJS],
        [_receiverAmount.mul(DECIMAL_USING_BNJS), ZERO_MUL_DECIMAL_IN_BNJS],
      )
      alert(`Hash: ${res.transaction_hash}`)
      setStartStreamSubmitButtonIsLoading(false)
    } catch (err) {
      alert(err.message)
      setStartStreamSubmitButtonIsLoading(false)
    }
  }

  const handleMinting = async () => {
    setMintSubmitButtonIsLoading(true)
    try {
      const _mintAmount = new BN(mintAmount)
      const res = await contract.mint(address, [
        _mintAmount.mul(DECIMAL_USING_BNJS),
        ZERO_MUL_DECIMAL_IN_BNJS,
      ])
      setMintAmount(0)
      alert(`Hash: ${res.transaction_hash}`)
      setMintSubmitButtonIsLoading(false)
    } catch (err) {
      alert(err.message)
      setMintSubmitButtonIsLoading(false)
    }
  }

  const handleMintAmount = (value) => {
    const amount = parseInt(value)
    if (amount > 0) {
      setMintAmount(amount)
    } else {
      setMintAmount(0)
    }
  }

  setInterval(async () => {
    if (contract !== '') {
      const balance = await getTokenBalance(testAddress)
      console.log(balance)
      setTestAddressBalance(balance)
    }
  }, 20000)

  return (
    <div className="App">
      <Container maxW="1200px" bg="white">
        <Box height={100}>
          <Text fontSize="5xl" float="left" marginTop="3" marginLeft="7">
            Streamify
          </Text>
          {!connected ? (
            <Button
              onClick={() => connectWallet()}
              padding={5}
              marginTop="6"
              float="right"
            >
              Connect Wallet
            </Button>
          ) : (
            <Button padding={5} marginTop="6" float="right">
              <Text as="b">Streamify Token:</Text>
              <Text>{balance} </Text>
              <Text>---{trimmedAddress}</Text>
            </Button>
          )}
        </Box>
        <Box margin="6">
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Mint
          </Text>
          <FormControl isRequired>
            <NumberInput
              min={0}
              marginRight="3"
              marginLeft="3"
              onChange={handleMintAmount}
            >
              <NumberInputField placeholder="Enter Amount" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          {!mintformValidity ? (
            <Button mt={4} ml={2} colorScheme="teal" type="submit" isDisabled>
              Mint
            </Button>
          ) : mintSubmitButtonIsLoading ? (
            <Button
              isLoading
              loadingText="Minting..."
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
            ></Button>
          ) : (
            <Button
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
              onClick={handleMinting}
            >
              Mint
            </Button>
          )}
        </Box>
        <Box margin="6">
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Start Stream
          </Text>
          <FormControl isRequired>
            <Input
              type="email"
              placeholder="Enter Address"
              marginRight="3"
              marginLeft="3"
              marginTop="3"
              onChange={handleReceiverAddress}
            />
          </FormControl>
          <FormControl isRequired>
            <NumberInput
              min={0}
              max={balance}
              margin="3"
              onChange={handleAmountPerSecond}
            >
              <NumberInputField placeholder="Enter Amount Per Second" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl isRequired>
            <NumberInput
              min={0}
              max={balance}
              marginRight="3"
              marginLeft="3"
              onChange={handleRecieverAmount}
            >
              <NumberInputField placeholder="Enter Deposit Amount" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          {!streamformValidity ? (
            <Button mt={4} ml={2} colorScheme="teal" type="submit" isDisabled>
              Start
            </Button>
          ) : startStreamSubmitButtonIsLoading ? (
            <Button
              isLoading
              loadingText="Starting Stream..."
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
            ></Button>
          ) : (
            <Button
              mt={4}
              ml={2}
              colorScheme="teal"
              type="submit"
              onClick={handleStartStream}
            >
              Start
            </Button>
          )}
        </Box>
        {/* <Box margin="6">
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Set Test Address
          </Text>
          <FormControl isRequired>
            <Input
              type="email"
              placeholder="Enter Address"
              marginRight="3"
              marginLeft="3"
              onSubmit={handleTestAddress}
            />
          </FormControl>
          <Button mt={4} ml={2} colorScheme="teal" type="submit">
            Set
          </Button>
        </Box> */}
        <Box margin="6" marginTop="10">
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Test Address:
            <Text color="red">{testAddress}</Text>
          </Text>
          <Text
            fontSize="2xl"
            fontFamily="mono"
            marginLeft="2"
            marginBottom="3"
          >
            Balance: <Text color="red">{testAddressBalance}</Text>
          </Text>
        </Box>
      </Container>
    </div>
  )
}

export default App
