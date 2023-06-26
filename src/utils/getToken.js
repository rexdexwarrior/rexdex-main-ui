export const getTokenObject = (tokenList, addr) =>
  tokenList.find((token) => token.address.toLowerCase() == addr.toLowerCase());
