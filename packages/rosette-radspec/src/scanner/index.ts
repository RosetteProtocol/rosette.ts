/**
 * @module radspec/scanner
 */
import {
  AT,
  BANG,
  BANG_EQUAL,
  BOOLEAN,
  COLON,
  COMMA,
  DOT,
  DOUBLE_VERTICAL_BAR,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  HEXADECIMAL,
  IDENTIFIER,
  LEFT_PAREN,
  LESS,
  LESS_EQUAL,
  MINUS,
  MODULO,
  MONOLOGUE,
  NUMBER,
  PLUS,
  POWER,
  QUESTION_MARK,
  RIGHT_PAREN,
  SLASH,
  STAR,
  STRING,
  TICK,
  TYPE,
} from '../types';
import type { Token, TokenType } from '../types';
import { isType } from '../types/solidity';

/**
 * Enum for scanner state.
 *
 */
enum ScannerState {
  OK = 'OK',
  ERROR = 'ERROR',
}

const NUMBERS_REGEX = /[0-9]/;
const HEX_REGEX = /[0-9a-f]/i;
const IDENTIFIERS_REGEX = /[_$a-z0-9]/i;

/**
 * A scanner that identifies tokens in a source string.
 *
 * @class Scanner
 * @param {string} source The source code
 * @property {string} state The state of the parser (`OK` or `ERROR`)
 * @property {string} source The source code
 * @property {number} cursor
 * @property {Array<Token>} tokens The currently identified tokens
 */
export class Scanner {
  #state: ScannerState;
  #isInExpression: boolean;
  #source: string;
  #cursor: number;
  #tokens: Token[];

  constructor(source: string) {
    this.#state = ScannerState.OK;
    this.#isInExpression = false;

    this.#source = source;
    this.#cursor = 0;

    this.#tokens = [];
  }

  /**
   * Scans a single token from source and pushes it to `Scanner.tokens`.
   *
   * @return {void}
   */
  scanToken() {
    const current = this.consume();

    if (current === '`') {
      this.#isInExpression = !this.#isInExpression;
      this.emitToken(TICK);
      return;
    }

    // We haven't hit a tick yet, so we're not in an expression
    if (!this.#isInExpression) {
      // Scan until tick
      let monologue = current;
      while (this.peek() !== '`' && !this.eof()) {
        monologue += this.consume();
      }
      this.emitToken(MONOLOGUE, monologue);
      return;
    }

    switch (current) {
      // Single character tokens
      case '(':
        this.emitToken(LEFT_PAREN);
        break;
      case ')':
        this.emitToken(RIGHT_PAREN);
        break;
      case ',':
        this.emitToken(COMMA);
        break;
      case '.':
        this.emitToken(DOT);
        break;
      case ':':
        this.emitToken(COLON);
        break;
      case '-':
        this.emitToken(MINUS);
        break;
      case '+':
        this.emitToken(PLUS);
        break;
      case '^':
        this.emitToken(POWER);
        break;
      case '*':
        this.emitToken(STAR);
        break;
      case '/':
        this.emitToken(SLASH);
        break;
      case '%':
        this.emitToken(MODULO);
        break;
      case '?':
        this.emitToken(QUESTION_MARK);
        break;
      case '@':
        this.emitToken(AT);
        break;

      // One or two character tokens
      case '!':
        this.emitToken(this.matches('=') ? BANG_EQUAL : BANG);
        break;
      case '=':
        this.emitToken(this.matches('=') ? EQUAL_EQUAL : EQUAL);
        break;
      case '<':
        this.emitToken(this.matches('=') ? LESS_EQUAL : LESS);
        break;
      case '>':
        this.emitToken(this.matches('=') ? GREATER_EQUAL : GREATER);
        break;

      // Two character tokens
      case '|':
        if (this.matches('|')) {
          this.emitToken(DOUBLE_VERTICAL_BAR);
        } else {
          this.report(`Unexpected single "|" (expecting two)`);
        }
        break;

      // Whitespace
      case ' ':
      case '\r':
      case '\n':
      case '\t':
        break;

      // Multi-character tokens
      default:
        if (NUMBERS_REGEX.test(current)) {
          let number = current;
          let type = NUMBER;

          // Detect hexadecimals
          if (current === '0' && this.peek() === 'x') {
            type = HEXADECIMAL;
            number += this.consume();

            while (HEX_REGEX.test(this.peek())) {
              number += this.consume();
            }
          } else {
            while (NUMBERS_REGEX.test(this.peek())) {
              number += this.consume();
            }
          }

          this.emitToken(type, number);
          break;
        }

        if (IDENTIFIERS_REGEX.test(current)) {
          let identifier = current;
          while (IDENTIFIERS_REGEX.test(this.peek())) {
            identifier += this.consume();
          }

          if (identifier === 'true' || identifier === 'false') {
            this.emitToken(BOOLEAN, identifier);
            break;
          }

          if (isType(identifier)) {
            this.emitToken(TYPE, identifier);
          } else {
            this.emitToken(IDENTIFIER, identifier);
          }
          break;
        }

        if (current === `'` || current === `"`) {
          let string = '';
          while (!this.matches(`'`) && !this.matches(`"`)) {
            string += this.consume();
          }
          this.emitToken(STRING, string);
          break;
        }

        this.report(`Unexpected character "${current}"`);
    }
  }

  /**
   * Push a token to `Scanner.tokens`
   *
   * @param type The token type
   * @param value The token value
   */
  emitToken(type: TokenType, value?: string) {
    const token: Token = { type };

    if (value) {
      token.value = value;
    }

    this.#tokens.push(token);
  }

  /**
   * Get the current character and increase the cursor by 1.
   *
   * @return The current character.
   */
  consume(): string {
    this.#cursor++;

    return this.#source[this.#cursor - 1];
  }

  /**
   * Get the character under the cursor without consuming it.
   *
   * @return The character under the cursor.
   */
  peek(): string {
    return this.#source[this.#cursor];
  }

  /**
   * Checks if the next character matches an expected one.
   *
   * Increases the cursor by 1 if the character matches.
   *
   * @param expected The character to expect.
   * @return True if the next character matches, otherwise false.
   */
  matches(expected: string): boolean {
    if (this.eof()) return false;
    if (this.peek() !== expected) {
      return false;
    }

    this.#cursor++;
    return true;
  }

  /**
   * Scans source and returns a list of tokens.
   *
   * @return The list of tokens.
   */
  async scan(): Promise<Token[] | undefined> {
    while (!this.eof()) {
      this.scanToken();
    }

    if (this.#state === ScannerState.ERROR) {
      console.error(`Errors encountered while scanning source`);
      return;
    }

    return this.#tokens;
  }

  /**
   * Returns true if we've reached the end of source, otherwise false.
   *
   * @return A boolean indicating the end of source.
   */
  eof(): boolean {
    return this.#cursor >= this.#source.length;
  }

  /**
   * Prints an error with location information to `stderr`
   * and sets the scanner state to `SCANNER_STATE.ERROR`
   *
   * @param error The error to be printed.
   */
  report(error: string) {
    this.#state = ScannerState.ERROR;
    console.error(`Error (${this.#cursor}): ${error}`);
  }
}

/**
 * Scans source and returns a list of tokens.
 *
 * @memberof radspec/scanner
 * @param source Source to be scanned.
 * @return The list of tokens.
 */
export function scan(source: string): Promise<Token[] | undefined> {
  return new Scanner(source).scan();
}
