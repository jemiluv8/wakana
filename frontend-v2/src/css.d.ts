// src/types/css.d.ts
declare module "*.css" {}

declare module "*.css?url" {
  const url: string;
  export default url;
}

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
