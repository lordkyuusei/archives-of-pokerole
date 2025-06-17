import type { Trainer } from "$lib/types/mongo/trainer";
import { setStorage } from "./storage.svelte";

let trainer: Trainer | null = $state(null);

export const getTrainer = () => trainer;
export const setTrainer = (newTrainer: Trainer | null) => {
  trainer = newTrainer;
  setStorage('trainer', trainer);
};

export const setTrainerProperty = <T extends keyof Trainer>(property: T, value: Trainer[T]) => {
  if (trainer) {
    trainer = { ...trainer, [property]: value };
    setStorage('trainer', trainer);
  }
}
