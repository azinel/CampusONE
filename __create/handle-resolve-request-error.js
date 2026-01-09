const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { reportErrorToRemote } = require('./report-error-to-remote');
const VIRTUAL_ROOT = path.join(__dirname, '../.metro-virtual');
const VIRTUAL_ROOT_UNRESOLVED = path.join(VIRTUAL_ROOT, 'unresolved');
const handleResolveRequestError = ({ error, context, moduleName, platform }) => {
  const errorMessage = `Unable to resolve module '${moduleName}' from '${context.originModulePath}'`;
  const syntheticError = new Error(errorMessage);
  syntheticError.stack = error.stack;
  reportErrorToRemote({ error: syntheticError }).catch((reportError) => {
  });
  if (process.env.NODE_ENV === 'production') throw error;
  if (platform !== 'web') throw error;
  const key = `${moduleName}|${context.originModulePath}|${platform}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex').slice(0, 16);
  fs.mkdirSync(VIRTUAL_ROOT_UNRESOLVED, { recursive: true });
  const vfile = path.join(VIRTUAL_ROOT_UNRESOLVED, `throw-${hash}.js`);
  const payload = {
    moduleName,
    from: context.originModulePath,
    platform,
    originalMessage: String(error?.message ? error.message : 'Unknown resolve error'),
  };
  const code = [
    '
    '(function(){',
    `  var info = ${JSON.stringify(payload)};`,
    "  var msg = 'Unable to resolve \"' + info.moduleName + '\" from \"' + info.from + '\"';",
    "  msg += '\\n\\n' + info.originalMessage;",
    '  var e = new Error(msg);',
    "  e.name = 'ModuleResolveError';",
    "  e.code = 'MODULE_RESOLVE_FAILED';",
    '  throw e;',
    '})();',
    'export {};',
    '',
  ].join('\n');
  fs.writeFileSync(vfile, code, 'utf8');
  return {
    filePath: vfile,
    type: 'sourceFile',
  };
};
module.exports = {
  handleResolveRequestError,
  VIRTUAL_ROOT,
  VIRTUAL_ROOT_UNRESOLVED,
};
