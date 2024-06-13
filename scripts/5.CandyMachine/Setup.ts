const candyMachineSettings = {
  authority: myCustomAuthority,
  tokenStandard: TokenStandard.NonFungible,
  sellerFeeBasisPoints: percentAmount(33.3, 2),
  symbol: "MYPROJECT",
  maxEditionSupply: 0,
  isMutable: true,
  creators: [
    { address: creatorA, percentageShare: 50, verified: false },
    { address: creatorB, percentageShare: 50, verified: false },
  ],
  collectionMint: collectionMint.publicKey,
  collectionUpdateAuthority,
  hiddenSettings: none(),
  configLineSettings: some({
    prefixName: "My NFT Project #$ID+1$",
    nameLength: 0,
    prefixUri: "https://arweave.net/",
    uriLength: 43,
    isSequential: false,
  }),
  configLineSettings: none(),
  hiddenSettings: some({
    name: "My NFT Project #$ID+1$",
    uri: "https://example.com/path/to/teaser.json",
    hash: hashOfTheFileThatMapsUris,
  }),
};
