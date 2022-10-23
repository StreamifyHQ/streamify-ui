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
  '0x0450c74da7186be1d066e3340218732bddedd1e86cd014baaa972e8ce4355ef4'

const DECIMAL = BigNumber.from('1000000000000000000')
const DECIMAL_USING_BNJS = new BN('1000000000000000000')
const ZERO_MUL_DECIMAL_IN_BNJS = new BN(0).mul(DECIMAL_USING_BNJS)

function App() {
  const [submitButtonIsLoading, setSubmitButtonIsLoading] = useState(false)
  const [receiverAddress, setReceiverAddress] = useState('')
  const [receiverAmount, setReceiverAmount] = useState(0)
  const [amountPerSecond, setAmountPerSound] = useState(0)
  const [formValidity, setFormValidity] = useState(false)
  const [balance, setBalance] = useState(0)
  const [contract, setContract] = useState('')
  const [account, setAccount] = useState('')
  const [address, setAddress] = useState('')
  const [trimmedAddress, setTrimmedAddress] = useState('')
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
      setFormValidity(true)
    } else {
      setFormValidity(false)
    }
  }, [receiverAmount, amountPerSecond, receiverAddress, connected])

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
    setSubmitButtonIsLoading(true)
    try {
      const _amountPerSecond = new BN(amountPerSecond)
      const _receiverAmount = new BN(receiverAmount)
      const res = await contract.start_stream(
        receiverAddress,
        [_amountPerSecond.mul(DECIMAL_USING_BNJS), ZERO_MUL_DECIMAL_IN_BNJS],
        [_receiverAmount.mul(DECIMAL_USING_BNJS), ZERO_MUL_DECIMAL_IN_BNJS],
      )
      console.log(res)
      alert(res.transaction_hash)
      setSubmitButtonIsLoading(false)
    } catch (err) {
      alert(err.message)
      setSubmitButtonIsLoading(false)
    }
  }

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
              <Text as="b">Streamy Token:</Text>
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
            Start Stream
          </Text>
          <FormControl isRequired>
            <Input
              type="email"
              placeholder="Enter Address"
              margin="2"
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
              margin="2"
              onChange={handleRecieverAmount}
            >
              <NumberInputField placeholder="Enter Deposit Amount" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          {!formValidity ? (
            <Button mt={4} ml={2} colorScheme="teal" type="submit" isDisabled>
              Start
            </Button>
          ) : submitButtonIsLoading ? (
            <Button
              isLoading
              loadingText="Starting Stream"
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
      </Container>
    </div>
  )
}

export default App
