import { commonPostMessage } from '@codesandbox/common/lib/utils/global';
import { FileSystemConfiguration } from '../../../../../../../../../../codesandbox-apps/codesandbox-browserfs';
import { getTypeFetcher } from './type-downloader';
import { EXTENSIONS_LOCATION } from '../../constants';

const global = self as any;

export const BROWSER_FS_CONFIG: FileSystemConfiguration = {
  fs: 'MountableFileSystem',
  options: {
    '/': { fs: 'InMemory', options: {} },
    '/tmp': { fs: 'InMemory', options: {} },
    '/sandbox': {
      fs: 'InMemory',
    },
    '/vscode': {
      fs: 'InMemory',
      options: {},
    },
    '/extensions': {
      fs: 'BundledHTTPRequest',
      options: {
        index: EXTENSIONS_LOCATION + '/extensions/index.json',
        baseUrl: EXTENSIONS_LOCATION + '/extensions',
        logReads: true,
        // logReads: process.env.NODE_ENV === 'development',
      },
    },
    // '/vscode': {
    //   fs: 'AsyncMirror',
    //   options: {
    //     sync: {
    //       fs: 'InMemory',
    //     },
    //     async: {
    //       fs: 'IndexedDB',
    //       options: {
    //         storeName: 'VSCode',
    //       },
    //     },
    //   },
    // },
  },
};

export async function initializeBrowserFS({
  syncSandbox = false,
  syncTypes = false,
  extraMounts = {},
} = {}) {
  return new Promise(resolve => {
    // console.log(BROWSER_FS_CONFIG);
    // console.trace();
    const config = { ...BROWSER_FS_CONFIG };
    let modulesByPath = {};

    if (syncSandbox) {
      if (syncTypes) {
        const { options } = getTypeFetcher();

        config.options['/sandbox/node_modules'] = {
          fs: 'CodeSandboxFS',
          options,
        };

        // config.options['/extensions/node_modules/typescript'] = {
        //   fs: 'JSDelivrRequest',
        //   options: {
        //     dependency: 'typescript',
        //     version: '4.1.2',
        //   },
        // };
      }

      config.options['/sandbox'] = {
        fs: 'CodeSandboxEditorFS',
        options: {
          api: {
            getState: () => ({
              modulesByPath,
            }),
          },
        },
      };
    }

    config.options = { ...config.options, ...extraMounts };

    global.BrowserFS.configure(config, e => {
      if (e) {
        console.error(e);
        return;
      }
      let resolved = false;

      if (syncSandbox) {
        self.addEventListener('message', evt => {
          if (evt.data.$type === 'file-sync') {
            modulesByPath = evt.data.$data;

            if (!resolved) {
              resolve();
              resolved = true;
            }
          }
        });

        commonPostMessage({ $type: 'request-data', $broadcast: true });
      } else {
        resolve();
      }

      // BrowserFS is initialized and ready-to-use!
    });
  });
}
