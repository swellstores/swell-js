function isServer() {
  return !(typeof window !== 'undefined' && window?.document);
}

export { isServer };
