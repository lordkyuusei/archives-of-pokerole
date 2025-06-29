import { KEY_BOXES } from "$lib/constants/storage";
import type { Box } from "$lib/types/box";
import { setStorage } from "./storage.svelte";

let box: Box | undefined = $state();
let boxes: Box[] = $state([]);

export const getBox = () => box;
export const getBoxes = () => boxes;

export const setBox = (newBox: Box | undefined) => box = newBox;
export const setBoxes = (newBoxes: Box[]) => {
    boxes = newBoxes;

    setStorage(KEY_BOXES, boxes);
}; 