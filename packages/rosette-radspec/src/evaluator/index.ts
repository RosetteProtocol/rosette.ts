/**
 * @module radspec/evaluator
 */

import { BigNumber, utils as ethersUtils } from 'ethers';
import type { providers } from 'ethers';

import HelperManager from '../helpers/HelperManager';
import { TYPES, isAddress, isInteger } from '../types/solidity';
import type { AST, Bindings, Node, Transaction } from '../types';
import {
  BANG_EQUAL,
  BinaryExpression,
  BoolLiteral,
  BytesLiteral,
  CallExpression,
  ComparisonExpression,
  DefaultExpression,
  EQUAL_EQUAL,
  ExpressionStatement,
  GREATER,
  GREATER_EQUAL,
  GroupedExpression,
  HelperFunction,
  Identifier,
  LESS,
  LESS_EQUAL,
  MINUS,
  MODULO,
  MonologueStatement,
  NodeType,
  NumberLiteral,
  PLUS,
  POWER,
  PropertyAccessExpression,
  SLASH,
  STAR,
  TernaryExpression,
} from '../types';

export interface EvaluatorOptions {
  /**
   * Available helpers
   */
  helperManager: HelperManager;
  provider: providers.Provider;
  transaction: Transaction;
}
/**
 * A value coupled with a type
 *
 * @class TypedValue
 * @param {string} type The type of the value
 * @param {*} value The value
 * @property {string} type
 * @property {*} value
 */
export class TypedValue {
  #type: string;
  #value: any;

  constructor(type: string, value: any) {
    this.#type = type;
    this.#value = value;

    if (isInteger(this.#type) && !BigNumber.isBigNumber(this.value)) {
      this.#value = BigNumber.from(this.#value);
    }

    if (this.#type === 'address') {
      if (!ethersUtils.isAddress(this.#value)) {
        throw new Error(`Invalid address "${this.#value}"`);
      }
      this.#value = ethersUtils.getAddress(this.#value);
    }
  }

  get type(): string {
    return this.#type;
  }

  get value(): any {
    return this.#value;
  }

  toString(): string {
    return `{ type: ${this.#type}, value: ${this.#value}}`;
  }
}

/**
 * Walks through an AST and evaluates each node.
 *
 * @class Evaluator
 * @param ast The AST to evaluate
 * @param bindings An object of bindings and their values
 * @param provider EIP 1193 provider
 * @param options An options object
 */
export class Evaluator {
  #ast: AST;
  #bindings: Bindings;
  // Tx data
  #from: TypedValue | undefined;
  #to: TypedValue | undefined;
  #data: TypedValue | undefined;
  #value: TypedValue | undefined;

  readonly helperManager: HelperManager;
  readonly provider: providers.Provider;

  constructor(ast: AST, bindings: Bindings, options: EvaluatorOptions) {
    const { helperManager, provider, transaction } = options;
    const { from, to, data, value = '0' } = transaction;

    this.#ast = ast;
    this.#bindings = bindings;
    this.#from = from ? new TypedValue('address', from) : undefined;
    this.#to = to ? new TypedValue('address', to) : undefined;
    this.#value = value
      ? new TypedValue('uint', BigNumber.from(value))
      : undefined;
    this.#data = data ? new TypedValue('bytes', data) : undefined;

    this.helperManager = helperManager || new HelperManager({}, { provider });
    this.provider = provider;
  }

  /**
   * Evaluate an array of AST nodes.
   *
   * @param nodes
   */
  #evaluateNodes(nodes: Node[]): Promise<(TypedValue | undefined)[]> {
    return Promise.all(nodes.map(this.#evaluateNode.bind(this)));
  }

  /**
   * Evaluate a single node.
   *
   * @param node The node to be evaluated.
   * @return {Promise<string>}
   */
  async #evaluateNode(node: Node): Promise<TypedValue | undefined> {
    if (node.type === ExpressionStatement) {
      const typedValues = await this.#evaluateNodes(node.body);

      return new TypedValue('string', this.#stringifyTypes(typedValues, ' '));
    }

    if (node.type === GroupedExpression) {
      return this.#evaluateNode(node.body);
    }

    if (node.type === MonologueStatement) {
      return new TypedValue('string', node.value);
    }

    if (node.type === NodeType.StringLiteral) {
      return new TypedValue('string', node.value || '');
    }

    if (node.type === NumberLiteral) {
      return new TypedValue('int256', node.value);
    }

    if (node.type === BytesLiteral) {
      const length = Math.ceil((node.value.length - 2) / 2);
      if (length > 32) {
        this.#panic('Byte literal represents more than 32 bytes');
      }

      return new TypedValue(`bytes${length}`, node.value);
    }

    if (node.type === BoolLiteral) {
      return new TypedValue('bool', node.value === 'true');
    }

    if (node.type === BinaryExpression) {
      const left = await this.#evaluateNode(node.left);
      const right = await this.#evaluateNode(node.right);

      if (left && right) {
        // String concatenation
        if (
          (left.type === 'string' || right?.type === 'string') &&
          node.operator === PLUS
        ) {
          return new TypedValue(
            'string',
            left.value.toString() + right.value.toString(),
          );
        }

        // TODO Additionally check that the type is signed if subtracting
        if (!isInteger(left.type) || !isInteger(right.type)) {
          this.#panic(
            `Cannot evaluate binary expression "${node.operator}" for non-integer types "${left.type}" and "${right.type}"`,
          );
        }

        switch (node.operator) {
          case PLUS:
            return new TypedValue('int256', left.value.add(right.value));
          case MINUS:
            return new TypedValue('int256', left.value.sub(right.value));
          case STAR:
            return new TypedValue('int256', left.value.mul(right.value));
          case POWER:
            return new TypedValue('int256', left.value.pow(right.value));
          case SLASH:
            return new TypedValue('int256', left.value.div(right.value));
          case MODULO:
            return new TypedValue('int256', left.value.mod(right.value));
          default:
            this.#panic(`Undefined binary operator "${node.operator}"`);
        }
      }
    }

    if (node.type === ComparisonExpression) {
      const left = await this.#evaluateNode(node.left);
      const right = await this.#evaluateNode(node.right);

      if (left && right) {
        let leftValue = left.value;
        let rightValue = right.value;

        const bothTypesAddress = (
          left: TypedValue,
          right: TypedValue,
        ): boolean =>
          // isAddress is true if type is address or bytes with size less than 20
          isAddress(left.type) && isAddress(right.type);

        const bothTypesBytes = (left: TypedValue, right: TypedValue): boolean =>
          TYPES.bytes.isType(left.type) && TYPES.bytes.isType(right.type);

        // Conversion to BigNumber for comparison will happen if:
        // - Both types are addresses or bytes of any size (can be different sizes)
        // - If one of the types is an address and the other bytes with size less than 20
        if (bothTypesAddress(left, right) || bothTypesBytes(left, right)) {
          leftValue = BigNumber.from(leftValue);
          rightValue = BigNumber.from(rightValue);
        } else if (!isInteger(left.type) || !isInteger(right.type)) {
          this.#panic(
            `Cannot evaluate binary expression "${node.operator}" for non-integer or fixed-size bytes types "${left.type}" and "${right.type}"`,
          );
        }

        switch (node.operator) {
          case GREATER:
            return new TypedValue('bool', leftValue.gt(rightValue));
          case GREATER_EQUAL:
            return new TypedValue('bool', leftValue.gte(rightValue));
          case LESS:
            return new TypedValue('bool', leftValue.lt(rightValue));
          case LESS_EQUAL:
            return new TypedValue('bool', leftValue.lte(rightValue));
          case EQUAL_EQUAL:
            return new TypedValue('bool', leftValue.eq(rightValue));
          case BANG_EQUAL:
            return new TypedValue('bool', !leftValue.eq(rightValue));
        }
      }
    }

    if (node.type === TernaryExpression) {
      if ((await this.#evaluateNode(node.predicate))?.value) {
        return this.#evaluateNode(node.left);
      }

      return this.#evaluateNode(node.right);
    }

    if (node.type === DefaultExpression) {
      const left = await this.#evaluateNode(node.left);
      let leftFalsey;

      if (left) {
        if (isInteger(left.type)) {
          leftFalsey = left.value.isZero();
        } else if (left.type === 'address' || left.type.startsWith('bytes')) {
          leftFalsey = /^0x[0]*$/.test(left.value);
        } else {
          leftFalsey = !left.value;
        }
        return leftFalsey ? this.#evaluateNode(node.right) : left;
      }
    }

    if (node && node.type === CallExpression) {
      let target: TypedValue | undefined;

      // Inject self
      if (
        this.#to &&
        node.target.type === Identifier &&
        node.target.value === 'self'
      ) {
        target = this.#to;
      } else {
        target = await this.#evaluateNode(node.target);
      }

      if (target?.type !== 'bytes20' && target?.type !== 'address') {
        this.#panic('Target of call expression was not an address');
      } else if (!ethersUtils.isAddress(target.value)) {
        this.#panic(`Invalid address "${this.#value}"`);
      }

      const inputs = await this.#evaluateNodes(node.inputs ?? []);
      const outputs = node.outputs ?? [];
      const selectedReturnValueIndex = outputs.findIndex(
        (output) => output.selected,
      );
      if (selectedReturnValueIndex === -1) {
        this.#panic(
          `No selected return value for function call "${node.callee}"`,
        );
      }
      const returnType = outputs[selectedReturnValueIndex].type;

      const abi = [
        {
          name: node.callee,
          type: 'function',
          inputs: inputs.map((t) => ({
            type: t ? t.type : '',
          })),
          outputs: outputs.map(({ type }) => ({
            type,
          })),
          stateMutability: 'view',
        },
      ];
      const ethersInterface = new ethersUtils.Interface(abi);

      const txData = ethersInterface.encodeFunctionData(
        node.callee,
        inputs.map((input) => (input ? input.value.toString() : '')),
      );

      const data = await this.provider.call({
        to: target?.value,
        data: txData,
      });

      const decodeData = ethersInterface.decodeFunctionResult(
        node.callee,
        data,
      );

      return new TypedValue(returnType, decodeData[selectedReturnValueIndex]);
    }

    if (node.type === HelperFunction) {
      const helperName = node.name;

      if (helperName && !this.helperManager.exists(helperName)) {
        this.#panic(`${helperName} helper function is not defined`);
      }

      const inputs = await this.#evaluateNodes(node.inputs ?? []);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = await this.helperManager.execute(helperName!, inputs);

      return new TypedValue(result.type, result.value);
    }

    if (node.type === PropertyAccessExpression && node.target.value === 'msg') {
      if (node.property === 'value') {
        return this.#value;
      }

      if (node.property === 'sender') {
        return this.#from;
      }

      if (node.property === 'data') {
        return this.#data;
      }

      this.#panic(
        `Expecting value, sender or data property for msg identifier but got: ${node.property}`,
      );
    }

    if (node.type === Identifier) {
      if (node.value === 'self') {
        return this.#to;
      }

      if (!this.#bindings[node.value]) {
        this.#panic(`Undefined binding "${node.value}"`);
      }

      const binding = this.#bindings[node.value];

      return new TypedValue(binding.type, binding.value);
    }
  }

  /**
   * Evaluate the entire AST.
   *
   * @return The result of the evaluation.
   */
  async evaluate(): Promise<string> {
    return this.#evaluateNodes(this.#ast.body).then((typedValues) => {
      return this.#stringifyTypes(typedValues);
    });
  }

  /**
   * Report an error and abort evaluation.
   *
   * @param msg The error message to report.
   */
  #panic(msg: string): void {
    throw new Error(msg);
  }

  #stringifyTypes(nodes: (TypedValue | undefined)[], separator = ''): string {
    return nodes.map((n) => n?.value ?? '').join(separator);
  }
}

/**
 * Evaluates an AST
 *
 * @memberof radspec/evaluator
 * @param {radspec/parser/AST} ast The AST to evaluate
 * @param {radspec/Bindings} bindings An object of bindings and their values
 * @param {?Object} options An options object
 * @return {string}
 */
export function evaluate(
  ast: AST,
  bindings: Bindings,
  options: EvaluatorOptions,
): Promise<string> {
  return new Evaluator(ast, bindings, options).evaluate();
}
