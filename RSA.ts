import * as fs from "fs";

function gcd_two_numbers(x, y) {
  if (typeof x !== "number" || typeof y !== "number") return false;
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    var t = y;
    y = x % y;
    x = t;
  }
  return x;
}

const isPrime = (num) => {
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
};

const find_e = (f_n: number) => {
  for (let e = 2; e < f_n; e++) {
    if (gcd_two_numbers(e, f_n) === 1) return e;
  }
  return 0;
};

const calc_d = (e: number, f_n: number) => {
  for (let d = e + 1; d <= e * f_n; d++) {
    if ((d * e) % f_n === 1) return d;
  }
  return 0;
};

const modPow = (base: number, exponent: number, modulus: number): number => {
  if (modulus === 1) return 0;

  let result = 1;
  base = base % modulus;

  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }

    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }

  return result;
};

const KeyGenerator = () => {
  const p = 83; // large prime number, not equal to q
  const q = 97; // large prime number, not equal to p
  const n = p * q;
  const f_n = (p - 1) * (q - 1);

  const e = find_e(f_n);
  const d = calc_d(e, f_n);

  const public_key = { e, n };
  const private_key = { d, n };

  return {
    public_key,
    private_key,
  };
};

const Encryption = (m: number, public_key: { e: number; n: number }) => {
  const { e, n } = public_key;
  const c = modPow(m, e, n); // meaning of the formula m ** e % n;
  return c;
};

const Decryption = (c: number, private_key: { d: number; n: number }) => {
  const { d, n } = private_key;
  const m = modPow(c, d, n); // meaning of the formula c ** d % n;
  return m;
};

class User {
  private _username: string;
  private _private_key: { d: number; n: number };
  public public_key: { e: number; n: number };
  private _messages: number[];

  constructor(username: string) {
    this._username = username;
    const keys = KeyGenerator();
    this._private_key = keys.private_key;
    this.public_key = keys.public_key;
    this._messages = [];
  }

  RSAMessageTransfer(message: number, recipient: User) {
    const encryptedMessage = Encryption(message, recipient.public_key);
    // fake interception to take message
    this.logToConsole(
      `${this._username} sent encrypted message ${encryptedMessage} to ${recipient._username}, public_key:{e:${recipient.public_key.e}, n:${recipient.public_key.n}}`
    );
    recipient.set_message(encryptedMessage);
  }

  private logToFileSync(message: string) {
    const logFileName = "message_log.txt";

    fs.appendFileSync(logFileName, `${message}\n`);
  }

  private logToConsole(message: string) {
    console.log(message);
  }

  get username(): string {
    return this._username;
  }

  set_message(message: number) {
    this._messages?.push(Decryption(message, this._private_key));
  }

  get messages(): number[] {
    return this._messages;
  }
}

const main = () => {
  const AliceUser = new User("Alice");
  const BobUser = new User("Bob");

  BobUser.RSAMessageTransfer(10, AliceUser);
  AliceUser.RSAMessageTransfer(7, BobUser);
  AliceUser.RSAMessageTransfer(5, BobUser);

  console.log(AliceUser.messages);
  console.log(BobUser.messages);
};

main();
