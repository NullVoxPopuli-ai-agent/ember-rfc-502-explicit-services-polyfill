import CookieStore from 'min-supported/domain/cookies/cookie-store';
import BrowserCookieStore from 'min-supported/domain/cookies/browser-cookie-store';
import ServerCookieStore from 'min-supported/domain/cookies/server-cookie-store';
import { overrideService } from 'ember-rfc-502-explicit-services-polyfill';

export function initialize(appInstance) {
  const fastboot = appInstance.lookup('service:fastboot');

  if (fastboot?.isFastBoot) {
    overrideService(appInstance, CookieStore, ServerCookieStore);
  } else {
    overrideService(appInstance, CookieStore, BrowserCookieStore);
  }
}

export default { initialize };
