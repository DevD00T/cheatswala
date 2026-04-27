export const limitLength = (str, length)=> {
    return str.length > length ? str.substring(0, length) + '...' : str;
}
