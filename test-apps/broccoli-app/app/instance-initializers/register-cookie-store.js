import CookieStore from 'broccoli-app/domain/cookies/cookie-store';
import BrowserCookieStore from 'broccoli-app/domain/cookies/browser-cookie-store';
import ServerCookieStore from 'broccoli-app/domain/cookies/server-cookie-store';
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
