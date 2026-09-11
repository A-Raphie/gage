"use client";

/**
 * Minimal injected-wallet layer for the console. Semantics per wallet-connect-fix:
 * account presence IS the connected state; wrong chain is a separate visible
 * action; never reload while a connect request is pending.
 */
import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

export const CC3_CHAIN_ID = 102031;
export const SEPOLIA_CHAIN_ID = 11155111;

export const CHAIN_PARAMS: Record<number, { name: string; rpc: string; symbol: string; explorer: string }> = {
  [CC3_CHAIN_ID]: {
    name: "Creditcoin CC3 Testnet",
    rpc: "https://rpc.cc3-testnet.creditcoin.network",
    symbol: "CTC",
    explorer: "https://creditcoin-testnet.blockscout.com",
  },
  [SEPOLIA_CHAIN_ID]: {
    name: "Sepolia",
    rpc: "https://ethereum-sepolia-rpc.publicnode.com",
    symbol: "ETH",
    explorer: "https://sepolia.etherscan.io",
  },
};

type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
};

function eth(): EthProvider | null {
  if (typeof window === "undefined") return null;
  const e = (window as unknown as { ethereum?: EthProvider }).ethereum;
  return e && typeof e.request === "function" ? e : null;
}

export interface WalletState {
  hasWallet: boolean;
  account: string | null;
  chainId: number | null;
  busy: boolean;
  error: string | null;
}

export function useInjectedWallet() {
  const [state, setState] = useState<WalletState>({
    hasWallet: false,
    account: null,
    chainId: null,
    busy: false,
    error: null,
  });

  useEffect(() => {
    const p = eth();
    setState((s) => ({ ...s, hasWallet: !!p }));
    if (!p) return;

    // adopt an already-granted session silently (eth_accounts, no prompt)
    const adopt = async () => {
      try {
        const accts = (await p.request({ method: "eth_accounts" })) as string[];
        if (accts?.length) {
          const cid = (await p.request({ method: "eth_chainId" })) as string;
          setState((s) => ({
            ...s,
            account: accts[0],
            chainId: parseInt(cid, 16),
          }));
        }
      } catch {
        /* wallet not granting yet */
      }
    };
    void adopt();
    const t = setInterval(adopt, 2500);

    const onAccounts = (...args: unknown[]) => {
      const accts = args[0] as string[];
      setState((s) => ({ ...s, account: accts?.[0] ?? null }));
    };
    const onChain = (...args: unknown[]) => {
      setState((s) => ({ ...s, chainId: parseInt(args[0] as string, 16) }));
    };
    p.on?.("accountsChanged", onAccounts);
    p.on?.("chainChanged", onChain);
    return () => {
      clearInterval(t);
      p.removeListener?.("accountsChanged", onAccounts);
      p.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    const p = eth();
    if (!p) {
      setState((s) => ({ ...s, error: "No injected wallet found. Install MetaMask or Rabby." }));
      return;
    }
    setState((s) => ({ ...s, busy: true, error: null }));
    try {
      const accts = (await p.request({ method: "eth_requestAccounts" })) as string[];
      const cid = (await p.request({ method: "eth_chainId" })) as string;
      setState((s) => ({ ...s, account: accts[0], chainId: parseInt(cid, 16), busy: false }));
    } catch (e) {
      setState((s) => ({ ...s, busy: false, error: (e as Error).message }));
    }
  }, []);

  const ensureChain = useCallback(async (chainId: number) => {
    const p = eth();
    if (!p) throw new Error("No injected wallet found.");
    const params = CHAIN_PARAMS[chainId];
    const current = (await p.request({ method: "eth_chainId" })) as string;
    const currentId = parseInt(current, 16);
    if (currentId === chainId) return;
    setState((s) => ({ ...s, busy: true, error: null }));
    try {
      await p.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + chainId.toString(16) }],
      });
    } catch (e) {
      const err = e as { code?: number; message?: string };
      if (err.code === 4902 || /unrecognized|not added/i.test(err.message ?? "")) {
        await p.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x" + chainId.toString(16),
              chainName: params.name,
              rpcUrls: [params.rpc],
              nativeCurrency: { name: params.symbol, symbol: params.symbol, decimals: 18 },
              blockExplorerUrls: [params.explorer],
            },
          ],
        });
      } else {
        setState((s) => ({ ...s, busy: false, error: err.message ?? "chain switch rejected" }));
        throw e;
      }
    }
    setState((s) => ({ ...s, chainId, busy: false }));
  }, []);

  /** Run a contract write on the given chain with the connected signer. */
  const write = useCallback(
    async (
      chainId: number,
      run: (signer: JsonRpcSigner) => Promise<{ hash: string; wait: () => Promise<unknown> }>,
    ): Promise<string> => {
      const p = eth();
      if (!p) throw new Error("No injected wallet found.");
      await ensureChain(chainId);
      setState((s) => ({ ...s, busy: true, error: null }));
      try {
        const browser = new BrowserProvider(p as unknown as import("ethers").Eip1193Provider);
        const signer = await browser.getSigner();
        const tx = await run(signer);
        await tx.wait();
        setState((s) => ({ ...s, busy: false }));
        return tx.hash;
      } catch (e) {
        setState((s) => ({ ...s, busy: false, error: (e as Error).message }));
        throw e;
      }
    },
    [ensureChain],
  );

  return { ...state, connect, ensureChain, write };
}

export function short(addr: string | null) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
