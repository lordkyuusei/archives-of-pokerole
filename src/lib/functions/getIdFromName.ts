export const getIdFromName = (name: string) => name.toLowerCase()
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll(' ', '-');