export interface Options {
  baseUrl: string;
  breaks: boolean;
}

export function getDefaultOptions(): Options {
  return {
    baseUrl: "",
    breaks: false,
  };
}

export let defaultOptions = getDefaultOptions();

export function changeDefaults(newDefaults:Options) {
  defaultOptions = newDefaults;
}
