export default interface IErrnoException extends Error {
  errno?: number;
  code?: string;
  constraint?: string,
  path?: string;
  syscall?: string;
  stack?: string;
}
