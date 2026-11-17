export default class CookieStore {
  get kind() {
    throw new Error('CookieStore is a contract; override it with an implementation');
  }
}
