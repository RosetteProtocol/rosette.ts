export type Binding = {
  /**
   * The type of the binding (a valid Radspec type).
   */
  type: string;
  /**
   * The value of the binding.
   */
  value: any;
};

export type Bindings = Record<string, Binding>;
