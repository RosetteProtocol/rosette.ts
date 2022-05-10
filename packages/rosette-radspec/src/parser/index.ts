/**
 * @module radspec/parser
 */

import type { AST, Node, Token } from '../types';
import {
  ASTType,
  AT,
  BANG,
  BANG_EQUAL,
  BOOLEAN,
  BinaryExpression,
  BoolLiteral,
  BytesLiteral,
  COLON,
  COMMA,
  CallExpression,
  ComparisonExpression,
  DOT,
  DefaultExpression,
  EQUAL_EQUAL,
  ExpressionStatement,
  GREATER,
  GREATER_EQUAL,
  GroupedExpression,
  HEXADECIMAL,
  HelperFunction,
  IDENTIFIER,
  Identifier,
  LEFT_PAREN,
  LESS,
  LESS_EQUAL,
  MINUS,
  MODULO,
  MONOLOGUE,
  MonologueStatement,
  NUMBER,
  NumberLiteral,
  PLUS,
  POWER,
  PropertyAccessExpression,
  RIGHT_PAREN,
  SLASH,
  STAR,
  STRING,
  StringLiteral,
  TICK,
  TYPE,
  TernaryExpression,
  TokenType,
  UnaryExpression,
} from '../types';

/**
 * Parser states
 */
enum ParserState {
  OK = 'OK',
  ERROR = 'ERROR',
}

/**
 * Parses a token list into an AST.
 *
 * @class Parser
 * @param {Array<Token>} tokens
 * @property {string} state The state of the parser (`OK` or `ERROR`)
 * @property {Array<Token>} tokens
 * @property {number} cursor
 */
export class Parser {
  #state: ParserState;
  #tokens: Token[];
  #cursor: number;

  constructor(tokens: Token[]) {
    this.#state = ParserState.OK;

    this.#tokens = tokens;
    this.#cursor = 0;
  }

  /**
   * Get the current token and increase the cursor by 1
   */
  consume(): Token {
    this.#cursor++;

    return this.#tokens[this.#cursor - 1];
  }

  /**
   * Get the previous token.
   */
  previous(): Token {
    return this.#tokens[this.#cursor - 1];
  }

  /**
   * Get the token under the cursor without consuming it.
   *
   * @return The token.
   */
  peek(): Token {
    return this.#tokens[this.#cursor];
  }

  /**
   * Checks if the type of the next token matches any of the expected types.
   *
   * Increases the cursor by 1 if the token matches.
   *
   * @param expected The expected types.
   * @return True if the next token matches, otherwise false.
   */
  matches(...expected: TokenType[]): boolean {
    if (this.eof()) return false;
    for (const type of expected) {
      if (this.peek().type === type) {
        this.#cursor++;
        return true;
      }
    }

    return false;
  }

  /**
   * Try to parse comparison operators.
   *
   * @param astBody Subtree of AST being walked
   * @return A node.
   */
  comparison(astBody: Node[]): Node | undefined {
    let node = this.addition(astBody);

    while (
      this.matches(
        GREATER,
        GREATER_EQUAL,
        LESS,
        LESS_EQUAL,
        EQUAL_EQUAL,
        BANG_EQUAL,
      )
    ) {
      const operator = this.previous().type;
      const right = this.addition(astBody);
      node = {
        type: ComparisonExpression,
        operator,
        left: node,
        right,
      };
    }

    if (this.matches(TokenType.QUESTION_MARK)) {
      node = {
        type: TernaryExpression,
        predicate: node,
        left: this.comparison(astBody),
      };

      if (!this.matches(TokenType.COLON)) {
        this.report('Half-baked ternary (expected colon)');
      }

      node.right = this.comparison(astBody);
    }

    if (this.matches(TokenType.DOUBLE_VERTICAL_BAR)) {
      node = {
        left: node,
        right: this.comparison(astBody),
        type: DefaultExpression,
      };
    }

    return node;
  }

  /**
   * Try to parse arithmetic operators.
   *
   * @param astBody Subtree of AST being walked
   * @return A node.
   */
  addition(astBody: Node[]) {
    let node = this.multiplication(astBody);

    while (this.matches(MINUS, PLUS)) {
      const operator = this.previous().type;
      const right = this.multiplication(astBody);
      node = {
        type: BinaryExpression,
        operator,
        left: node,
        right,
      };
    }

    return node;
  }

  /**
   * Try to parse binary operators.
   *
   * @param astBody Subtree of AST being walked
   * @return A node.
   */
  multiplication(astBody: Node[]): Node | undefined {
    let node = this.power(astBody);

    while (this.matches(SLASH, STAR, MODULO)) {
      const operator = this.previous().type;
      const right = this.power(astBody);

      node = {
        type: BinaryExpression,
        operator,
        left: node,
        right,
      };
    }

    return node;
  }

  /**
   * Try to parse exponential operators.
   *
   * @param astBody Subtree of AST being walked
   * @return A node.
   */
  power(astBody: Node[]): Node | undefined {
    let node = this.unary(astBody);

    while (this.matches(POWER)) {
      const operator = this.previous().type;
      const right = this.unary(astBody);

      node = {
        type: BinaryExpression,
        operator,
        left: node,
        right,
      };
    }

    return node;
  }

  /**
   * Try to parse unary operators.
   *
   * @param astBody Subtree of AST being walked
   * @return A node.
   */
  unary(astBody: Node[]): Node | undefined {
    if (this.matches(BANG, MINUS)) {
      const operator = this.previous().type;
      const right = this.unary(astBody);

      return {
        type: UnaryExpression,
        operator,
        right,
      };
    }

    return this.identifier(astBody);
  }

  /**
   * Try to parse identifiers and call expressions.
   *
   * @param astBody Subtree of AST being walked
   * @return A node.
   */
  identifier(astBody: Node[]): Node | undefined {
    let node: Node | undefined;

    if (this.matches(IDENTIFIER)) {
      node = {
        type: Identifier,
        value: this.previous().value,
      };
    }

    if (!node) {
      const previousNode = astBody.length && astBody[astBody.length - 1];
      if (
        previousNode &&
        (previousNode.type === Identifier ||
          previousNode.type === GroupedExpression ||
          previousNode.type === CallExpression)
      ) {
        node = previousNode;
        // Consume the last node as part of this node
        astBody.pop();
      }
    }

    if (node) {
      while (this.matches(DOT)) {
        const property = this.consume().value;

        node = {
          type: PropertyAccessExpression,
          target: node,
          property,
        };
      }

      if (this.matches(LEFT_PAREN)) {
        node = {
          type: CallExpression,
          target: node.target,
          callee: node.property,
          inputs: this.functionInputs(astBody),
          outputs: [],
        } as Node;

        if (this.eof()) {
          // TODO Better error
          this.report('Unterminated call expression');
        }

        node.outputs = this.typeList();
      }

      return node;
    }

    return this.helper(astBody);
  }

  /**
   * Try to parse helper functions
   *
   * @param astBody Subtree of AST being walked
   * @return A node.
   */
  helper(astBody: Node[]): Node | undefined {
    if (this.matches(AT)) {
      const identifier = this.consume();
      const name = identifier.value;

      if (identifier.type !== IDENTIFIER) {
        this.report(`Invalid helper function name '${name}' provided after @`);
      }

      const node: Node = {
        type: HelperFunction,
        name: name,
        inputs: [],
      };

      if (this.matches(LEFT_PAREN)) {
        node.inputs = this.functionInputs(astBody) ?? [];
      } else {
        this.report(`Expected '(' for executing helper function`);
      }

      return node;
    }

    return this.primary(astBody);
  }

  /**
   * Try to parse primaries (literals).
   *
   * @param  {Array<Node>} _astBody Subtree of AST being walked.
   * @return A node
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  primary(_astBody: Node[]): Node | undefined {
    if (this.matches(NUMBER, STRING, HEXADECIMAL, BOOLEAN)) {
      const possibleTypes = {
        NUMBER: NumberLiteral,
        STRING: StringLiteral,
        HEXADECIMAL: BytesLiteral,
        BOOLEAN: BoolLiteral,
      };
      const type =
        possibleTypes[this.previous().type as keyof typeof possibleTypes];

      return {
        type,
        value: this.previous().value,
      } as Node;
    }

    if (this.matches(LEFT_PAREN)) {
      let expression;

      do {
        // Keep munching expressions in the context of the current expression
        expression = this.comparison(expression ? [expression] : []);
      } while (!this.eof() && !this.matches(RIGHT_PAREN));

      if (this.eof()) {
        this.report('Unterminated grouping');
      }

      return {
        type: GroupedExpression,
        body: expression,
      };
    }

    this.report(`Unknown token "${this.consume().type}"`);
  }

  /**
   * Try to parse a type.
   *
   * @return The type
   */
  type(): any {
    if (!this.matches(COLON) && this.peek().type !== TYPE) {
      // TODO Better error
      this.report(`Expected a type, got "${this.peek().type}"`);
    }

    return this.consume().value;
  }

  /**
   * Try to parse a type list.
   *
   * @return {Array<string>} The list of types
   */
  typeList(): { type: any; selected: boolean }[] {
    if (
      !this.matches(COLON) &&
      (this.peek().type !== TYPE || this.peek().type !== LEFT_PAREN)
    ) {
      // TODO Better error
      this.report(
        `Expected a type or a list of types, got "${this.peek().type}"`,
      );
    }

    // We just have a single type
    if (!this.matches(LEFT_PAREN)) {
      return [
        {
          type: this.consume().value,
          selected: true,
        },
      ];
    }

    const typeList = [];
    while (!this.eof() && !this.matches(RIGHT_PAREN)) {
      // Check if the type is preceded by a < to denote
      // that this is the type of the return value we want.
      const selected = this.matches(LESS);
      if (this.peek().type !== TYPE) {
        this.report(
          `Unexpected identifier in type list, expected type, got "${
            this.peek().type
          }"`,
        );
      }

      typeList.push({
        type: this.consume().value,
        selected,
      });

      // If the type was preceded by a <, then it
      // should be followed by a >.
      if (selected && !this.matches(GREATER)) {
        this.report(`Unclosed selected type`);
      }

      // If this is true, then types have been specified without delimiting them using commas.
      if (!this.matches(COMMA) && this.peek().type !== RIGHT_PAREN) {
        this.report(
          'Undelimited parameter type (expected comma delimiter or closing brace)',
        );
      }
    }

    if (this.eof()) {
      // TODO Better error
      this.report(`Unclosed type list`);
    }

    // Verify that at least one type in the type list has been selected
    // as the type of the return value.
    //
    // If no type has been selected, and the number of types in the type
    // list is exactly 1, then we assume that that type should be
    // marked as selected.
    const hasSelectedTypeInList = !!typeList.find((item) => item.selected);
    if (!hasSelectedTypeInList && typeList.length === 1) {
      typeList[0].selected = true;
    } else if (!hasSelectedTypeInList) {
      this.report(`Type list has no selected type`);
    }

    return typeList;
  }

  /**
   * Try to parse function arguments.
   *
   * @param  astBody Subtree of AST being walked.
   * @return A group of nodes.
   */
  functionInputs(astBody: Node[]): Node[] {
    const inputs: Node[] = [];

    while (!this.eof() && !this.matches(RIGHT_PAREN)) {
      const input = this.comparison(astBody);
      if (input && !input.type) {
        input.type = this.type();
      } else if (this.matches(COLON)) {
        this.report(`Unexpected type (already inferred type of parameter)`);
      }

      if (input) {
        inputs.push(input);
      }

      // If this is true, then types have been specified without delimiting them using commas.
      if (!this.matches(COMMA) && this.peek().type !== RIGHT_PAREN) {
        this.report(
          'Undelimited parameter type (expected comma delimiter or closing brace)',
        );
      }
    }

    return inputs;
  }

  /**
   * Walk all possible paths and try to parse a single node
   * from the list of tokens.
   *
   * @param  astBody Subtree of AST being walked
   * @return {Node}
   */
  walk(astBody: Node[]): Node | undefined {
    const token = this.peek();

    if (token.type === MONOLOGUE) {
      return {
        type: MonologueStatement,
        value: this.consume().value,
      };
    }

    if (token.type === TICK) {
      const node: Node = {
        type: ExpressionStatement,
        body: [],
      };

      this.matches(TICK);

      while (!this.eof() && this.peek().type !== TICK) {
        node.body.push(this.walk(node.body));
      }

      if (this.eof()) {
        this.report('Unterminated expression');
      }

      this.matches(TICK);

      return node;
    }

    return this.comparison(astBody);
  }

  /**
   * Walks the token list and returns an AST.
   *
   * @return A promise that resolves to an AST.
   */
  async parse(): Promise<AST> {
    const ast: AST = {
      type: ASTType.Program,
      body: [],
    };

    while (!this.eof()) {
      const node = this.walk(ast.body);
      if (node) {
        ast.body.push(node);
      }
    }

    if (this.#state === ParserState.ERROR) {
      console.error(`Errors encountered while parsing source`);
      return ast;
    }

    return ast;
  }

  /**
   * Returns true if we've reached the end of the token list, otherwise false.
   */
  eof(): boolean {
    return this.#cursor >= this.#tokens.length;
  }

  /**
   * Prints an error with location information to `stderr`
   * and sets the parser state to `PARSER_STATE.ERROR`
   */
  report(error: string) {
    this.#state = ParserState.ERROR;
    console.error(`Error (${this.#cursor}): ${error}`);
  }
}

/**
 * Walks token list and returns an AST.
 *
 * @param tokens The token list.
 * @return The AST.
 */
export function parse(tokens: Token[]): Promise<AST> {
  return new Parser(tokens).parse();
}
