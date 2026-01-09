
const IGNORE_LIST = [
  /^Running application "main"/,
  /props\.pointerEvents is deprecated\. Use style\.pointerEvents/,
  /"shadow.*" style props are deprecated\. Use "boxShadow"/,
];
function serialize(value: unknown) {
  return JSON.stringify(value, (_k, v) => {
    if (v instanceof Date) {
      return { __t: 'Date', v: v.toISOString() };
    }
    if (v instanceof Error) {
      return {
        __t: 'Error',
        v: { name: v.name, message: v.message, stack: v.stack },
      };
    }
    return v;
  });
}
if (typeof window !== 'undefined') {
  for (const level of ['log', 'info', 'warn', 'error', 'debug', 'table', 'trace'] as const) {
    const orig = console[level]?.bind(console);
    console[level] = (...args: unknown[]) => {
      orig?.(...args);
      if (IGNORE_LIST.some((regex) => typeof args[0] === 'string' && regex.test(args[0]))) {
        return;
      }
      try {
        window.parent.postMessage(
          {
            type: 'sandbox:mobile:console-write',
            __expoConsole: true,
            level,
            args: args.map(serialize),
          },
          '*'
        );
      } catch {
      }
    };
  }
}
