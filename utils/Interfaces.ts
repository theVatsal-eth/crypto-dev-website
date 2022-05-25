import { providers } from "ethers"

export interface NFTProvider extends providers.Web3Provider {
    getAddress(): Promise<string>
  }
export interface NFTSigner extends providers.JsonRpcSigner {
    getAddress(): Promise<string>
  }
