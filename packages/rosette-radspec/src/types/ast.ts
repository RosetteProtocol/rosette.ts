import type { TokenType } from './token';

export enum ASTType {
  Program = 'Program',
}

export enum NodeType {
  CallExpression = 'CallExpression',
  ComparisonExpression = 'ComparisonExpression',
  BinaryExpression = 'BinaryExpression',
  BoolLiteral = 'BoolLiteral',
  BytesLiteral = 'BytesLiteral',
  DefaultExpression = 'DefaultExpression',
  ExpressionStatement = 'ExpressionStatement',
  GroupedExpression = 'GroupedExpression',
  HelperFunction = 'HelperFunction',
  Identifier = 'Identifier',
  MonologueStatement = 'MonologueStatement',
  NumberLiteral = 'NumberLiteral',
  PropertyAccessExpression = 'PropertyAccessExpression',
  StringLiteral = 'StringLiteral',
  TernaryExpression = 'TernaryExpression',
  UnaryExpression = 'UnaryExpression',
}

/**
 * An AST node.
 */
export type Node = {
  /**
   * The node's type.
   */
  type: NodeType;
  /**
   * The node's name
   */
  name?: string;
  operator?: TokenType;
  left?: any;
  right?: any;
  /**
   * The node's value.
   */
  value?: any;
  body?: any;
  predicate?: any;
  target?: any;
  inputs?: Node[];
  outputs?: any[];
  property?: any;
  callee?: any;
};

/**
 * An AST
 */
export type AST = {
  /**
   * The AST type.
   */
  type: string;
  /**
   * The AST nodes.
   */
  body: Node[];
};

export const {
  CallExpression,
  ComparisonExpression,
  BinaryExpression,
  BoolLiteral,
  BytesLiteral,
  DefaultExpression,
  ExpressionStatement,
  GroupedExpression,
  HelperFunction,
  Identifier,
  MonologueStatement,
  NumberLiteral,
  PropertyAccessExpression,
  StringLiteral,
  TernaryExpression,
  UnaryExpression,
} = NodeType;
