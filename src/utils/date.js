export function timestampToHumanReadable(timestamp) {
    const dateObject = new Date(timestamp * 1000); // Multiply by 1000 because JS works in milliseconds instead of the UNIX seconds
    const humanReadable = dateObject.toLocaleString(); // Converts to local string with date and time
    return humanReadable;
}
