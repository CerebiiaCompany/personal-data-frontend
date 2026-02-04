// Recursively makes every property optional (and recurses into arrays/objects)
export type UpdatePartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? Array<UpdatePartial<U>>
    : T[K] extends object
    ? UpdatePartial<T[K]>
    : T[K];
};
