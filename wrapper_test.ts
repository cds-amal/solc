import { it, describe, run, expect, beforeAll } from 'https://deno.land/x/tincan@1.0.1/mod.ts'
import { wrapper } from './wrapper.ts'
import { createRequire } from './deps.ts'
import { download } from 'solc/download'
import type { Input, Output, Wrapper } from 'solc/types'

const require = createRequire(import.meta.url)

const contract = `
// SPDX-License-Identifier: MIT
pragma solidity >=0.8;

contract HelloWorld {
    string public greet = "Hello World!";
}
`

describe('solc/wrapper.ts', () => {
  let solc: Wrapper
  beforeAll(async () => {
    await download('./soljson_test.js', '0.8.18')
    solc = wrapper(require('./soljson_test.js'))
  })
  it('returns JS interface', async () => {
    expect(solc.compile).toBeDefined()
    expect(solc.version()).toBe('0.8.18+commit.87f61d96.Emscripten.clang')
    expect(solc.semver()).toBe('0.8.18+commit.87f61d96.Emscripten.clang')
    expect(solc.license()).toContain('Most of the code is licensed under GPLv3 (see below), the license for individual')
  })
  it('compiles a Solidity file', async () => {
    const input: Input = {
      language: 'Solidity',
      sources: {
        'Hello.sol': { content: contract }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    }
    const output: Output = JSON.parse(solc.compile(JSON.stringify(input)))
    expect(output.sources!['Hello.sol'].id).toEqual(0)
    expect(output.contracts!['Hello.sol']['HelloWorld'].abi).toEqual([
      {
        inputs: [],
        name: 'greet',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function'
      }
    ])
  })
})

run()
