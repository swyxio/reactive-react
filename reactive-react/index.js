import { createElement, createHandler } from "./element";
import { Component } from "./component";
import { mount, INITIALSOURCE } from "./reconciler";

export default {
  INITIALSOURCE,
  createElement,
  createHandler,
  Component,
  mount
};

export { createElement, createHandler, Component, INITIALSOURCE, mount };
