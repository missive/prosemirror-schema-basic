var ref = require("prosemirror-model");
var Schema = ref.Schema;

// :: Object
//
//   doc:: NodeSpec The top level document node.
//
//   paragraph:: NodeSpec A plain paragraph textblock.
//
//   blockquote:: NodeSpec A blockquote wrapping one or more blocks.
//
//   horizontal_rule:: NodeSpec A horizontal rule.
//
//   heading:: NodeSpec A heading textblock, with a `level`
//   attribute that should hold the number 1 to 6.
//
//   code_block:: NodeSpec A code listing. Disallows marks or
//   non-text inline nodes by default.
//
//   text:: NodeSpec The text node.
//
//   image:: NodeSpec An inline image node. Supports `src`, `alt`, and
//   `href` attributes. The latter two default to the empty string.
//
//   hard_break:: NodeSpec A hard line break.
var nodes = {
  doc: {
    content: "block+"
  },

  paragraph: {
    content: "inline<_>*",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM: function toDOM() { return ["p", 0] }
  },

  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{tag: "blockquote"}],
    toDOM: function toDOM() { return ["blockquote", 0] }
  },

  horizontal_rule: {
    group: "block",
    parseDOM: [{tag: "hr"}],
    toDOM: function toDOM() { return ["hr"] }
  },

  heading: {
    attrs: {level: {default: 1}},
    content: "inline<_>*",
    group: "block",
    defining: true,
    parseDOM: [{tag: "h1", attrs: {level: 1}},
               {tag: "h2", attrs: {level: 2}},
               {tag: "h3", attrs: {level: 3}},
               {tag: "h4", attrs: {level: 4}},
               {tag: "h5", attrs: {level: 5}},
               {tag: "h6", attrs: {level: 6}}],
    toDOM: function toDOM(node) { return ["h" + node.attrs.level, 0] }
  },

  code_block: {
    content: "text*",
    group: "block",
    code: true,
    defining: true,
    parseDOM: [{tag: "pre", preserveWhitespace: true}],
    toDOM: function toDOM() { return ["pre", ["code", 0]] }
  },

  text: {
    group: "inline"
  },

  image: {
    inline: true,
    attrs: {
      src: {},
      alt: {default: null},
      title: {default: null}
    },
    group: "inline",
    draggable: true,
    parseDOM: [{tag: "img[src]", getAttrs: function getAttrs(dom) {
      return {
        src: dom.getAttribute("src"),
        title: dom.getAttribute("title"),
        alt: dom.getAttribute("alt")
      }
    }}],
    toDOM: function toDOM(node) { return ["img", node.attrs] }
  },

  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{tag: "br"}],
    toDOM: function toDOM() { return ["br"] }
  }
}
exports.nodes = nodes

// :: Object
//
//  link:: MarkSpec A link. Has `href` and `title` attributes.
//  `title` defaults to the empty string.
//
//  em:: MarkSpec An emphasis mark.
//
//  strong:: MarkSpec A strong mark.
//
//  code:: MarkSpec Code font mark.
var marks = {
  link: {
    attrs: {
      href: {},
      title: {default: null}
    },
    inclusive: false,
    parseDOM: [{tag: "a[href]", getAttrs: function getAttrs(dom) {
      return {href: dom.getAttribute("href"), title: dom.getAttribute("title")}
    }}],
    toDOM: function toDOM(node) { return ["a", node.attrs] }
  },

  em: {
    parseDOM: [{tag: "i"}, {tag: "em"},
               {style: "font-style", getAttrs: function (value) { return value == "italic" && null; }}],
    toDOM: function toDOM() { return ["em"] }
  },

  strong: {
    parseDOM: [{tag: "strong"},
               // This works around a Google Docs misbehavior where
               // pasted content will be inexplicably wrapped in `<b>`
               // tags with a font-weight normal.
               {tag: "b", getAttrs: function (node) { return node.style.fontWeight != "normal" && null; }},
               {style: "font-weight", getAttrs: function (value) { return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null; }}],
    toDOM: function toDOM() { return ["strong"] }
  },

  code: {
    parseDOM: [{tag: "code"}],
    toDOM: function toDOM() { return ["code"] }
  }
}
exports.marks = marks

// :: Schema
// This schema rougly corresponds to the document schema used by
// CommonMark, minus the list elements, which are defined in the
// [schema-list](#schema-list) module.
//
// To reuse elements from this schema, extend or read from its
// `spec.nodes` and `spec.marks` [properties](#model.Schema.spec).
var schema = new Schema({nodes: nodes, marks: marks})
exports.schema = schema
