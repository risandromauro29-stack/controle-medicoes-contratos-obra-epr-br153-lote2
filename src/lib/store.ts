import type { Obra } from "../types";
import seedObra from "../data/seed/obra-156-epr-br153-lote2.json";

const STORAGE_KEY = "cmo:obras:v1";

/**
 * Camada de persistência isolada atrás de uma interface simples (list/get/save/remove).
 * Hoje usa localStorage; quando houver backend, troque a implementação de
 * ObraRepository sem tocar nas telas.
 */
export interface ObraRepository {
  list(): Obra[];
  get(id: string): Obra | undefined;
  save(obra: Obra): void;
  remove(id: string): void;
}

function readAll(): Obra[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = [seedObra as unknown as Obra];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Obra[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("vazio");
    return parsed;
  } catch {
    const seeded = [seedObra as unknown as Obra];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeAll(obras: Obra[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obras));
}

export const localObraRepository: ObraRepository = {
  list() {
    return readAll();
  },
  get(id) {
    return readAll().find((o) => o.id === id);
  },
  save(obra) {
    const obras = readAll();
    const idx = obras.findIndex((o) => o.id === obra.id);
    if (idx >= 0) obras[idx] = obra;
    else obras.push(obra);
    writeAll(obras);
  },
  remove(id) {
    writeAll(readAll().filter((o) => o.id !== id));
  },
};

export function resetToSeed(): void {
  localStorage.removeItem(STORAGE_KEY);
}
