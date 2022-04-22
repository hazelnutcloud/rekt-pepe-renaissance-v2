export const formatAddress = (address) => {
    return String(address).slice(0,6)+'...'+String(address).slice(-4);
}