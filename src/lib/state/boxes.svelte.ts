import type { Box } from "$lib/types/box";

let box: Box | undefined = $state();
let boxes: Box[] = $state([]);

export const getBox = () => box;
export const getBoxes = () => boxes;

export const setBox = (newBox: Box | undefined) => box = newBox;
export const setBoxes = (newBoxes: Box[]) => boxes = newBoxes; 