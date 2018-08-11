import { createElement, createHandler } from "./element";
import { Component } from "./component";
import { renderStream } from "./reconciler"
import { mount } from "./scheduler";

export default {
  renderStream,
  createElement,
  createHandler,
  Component,
  mount
};

export { createElement, createHandler, Component, 
  renderStream, 
  mount };
