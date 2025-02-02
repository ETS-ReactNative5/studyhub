import * as childProcess from '../../../../node-services/lib/child_process';
// TODO dev/prod url
// @ts-ignore
import SubWorkLoader from 'worker-loader?publicPath=/static/js/bundles/&name=sub-dynamic-worker.[hash:8].worker.js!./generic-2';
import { initializeAll } from '../common/global';

childProcess.addDefaultForkHandler(SubWorkLoader);

initializeAll().then(() => {
  // Use require so that it only starts executing the chunk with all globals specified.
  require('../workers/generic-worker').start({
    syncSandbox: true,
    syncTypes: true,
  });
});
