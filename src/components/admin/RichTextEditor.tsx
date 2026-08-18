"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";

// A lightweight WYSIWYG editor (contentEditable) so writers see formatted text
// like in Word/Docs — not raw HTML tags. It stores/produces clean HTML, reuses
// the site's `prose-article` styles for a true what-you-see-is-what-you-get
// surface, and only offers H2/H3 (the post Title is the page's single H1).
export type RichTextEditorHandle = {
  insertHTML: (html: string) => void;
  focus: () => void;
};

type Props = {
  value: string;
  onChange: (html: string) => void;
  onImageClick?: () => void;
  imageBusy?: boolean;
  placeholder?: string;
};

const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(
  function RichTextEditor(
    { value, onChange, onImageClick, imageBusy, placeholder },
    ref,
  ) {
    const elRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    // Load existing content ONCE. We deliberately don't re-sync value→innerHTML
    // on every render — that would reset the caret while typing.
    useEffect(() => {
      if (elRef.current && !initialized.current) {
        elRef.current.innerHTML = value || "";
        initialized.current = true;
      }
    }, [value]);

    // Prefer semantic tags for SEO (<strong>/<em> over <b>/<i>).
    function normalize(html: string) {
      return html
        .replace(/<b>/gi, "<strong>")
        .replace(/<\/b>/gi, "</strong>")
        .replace(/<i>/gi, "<em>")
        .replace(/<\/i>/gi, "</em>");
    }

    function sync() {
      onChange(normalize(elRef.current?.innerHTML ?? ""));
    }

    function exec(cmd: string, arg?: string) {
      elRef.current?.focus();
      try {
        document.execCommand("styleWithCSS", false, "false");
      } catch {
        /* not supported — falls back to tag-based formatting */
      }
      document.execCommand(cmd, false, arg);
      sync();
    }

    function block(tag: string) {
      exec("formatBlock", tag);
    }

    function inlineCode() {
      const sel = window.getSelection();
      const text = sel && sel.rangeCount ? sel.toString() : "";
      exec("insertHTML", `<code>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`);
    }

    function link() {
      const url = window.prompt("Link URL (https://… or /blog/…):", "https://");
      if (url) exec("createLink", url);
    }

    useImperativeHandle(ref, () => ({
      insertHTML(html: string) {
        elRef.current?.focus();
        document.execCommand("insertHTML", false, html);
        sync();
      },
      focus() {
        elRef.current?.focus();
      },
    }));

    const isEmpty = !value || value === "<br>" || value === "<p></p>";

    return (
      <div>
        <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-lg bg-background border border-white/10">
          <ToolBtn title="Bold (Ctrl+B)" onClick={() => exec("bold")}>
            <span className="font-bold">B</span>
          </ToolBtn>
          <ToolBtn title="Italic (Ctrl+I)" onClick={() => exec("italic")}>
            <span className="italic">I</span>
          </ToolBtn>
          <ToolBtn title="Underline (Ctrl+U)" onClick={() => exec("underline")}>
            <span className="underline">U</span>
          </ToolBtn>
          <ToolBtn title="Strikethrough" onClick={() => exec("strikeThrough")}>
            <span className="line-through">S</span>
          </ToolBtn>

          <Divider />

          <ToolBtn title="Heading 2" onClick={() => block("h2")}>H2</ToolBtn>
          <ToolBtn title="Heading 3" onClick={() => block("h3")}>H3</ToolBtn>
          <ToolBtn title="Paragraph" onClick={() => block("p")}>P</ToolBtn>

          <Divider />

          <ToolBtn title="Quote" onClick={() => block("blockquote")}>❝</ToolBtn>
          <ToolBtn title="Inline code" onClick={inlineCode}>{"</>"}</ToolBtn>
          <ToolBtn title="Code block" onClick={() => block("pre")}>{"{ }"}</ToolBtn>

          <Divider />

          <ToolBtn title="Bulleted list" onClick={() => exec("insertUnorderedList")}>•</ToolBtn>
          <ToolBtn title="Numbered list" onClick={() => exec("insertOrderedList")}>1.</ToolBtn>

          <Divider />

          <ToolBtn title="Link" onClick={link}>🔗</ToolBtn>
          <ToolBtn title="Horizontal rule" onClick={() => exec("insertHorizontalRule")}>—</ToolBtn>

          {onImageClick && (
            <div className="ml-auto">
              <ToolBtn title="Insert image (upload)" disabled={imageBusy} onClick={onImageClick}>
                {imageBusy ? "…" : "🖼"}
                <span className="ml-1 hidden sm:inline">Image</span>
              </ToolBtn>
            </div>
          )}
        </div>

        <div className="relative mt-3">
          {isEmpty && placeholder && (
            <p className="pointer-events-none absolute left-4 top-3 text-sm text-foreground-subtle">
              {placeholder}
            </p>
          )}
          <div
            ref={elRef}
            contentEditable
            suppressContentEditableWarning
            onInput={sync}
            onBlur={sync}
            role="textbox"
            aria-multiline="true"
            aria-label="Article content"
            className="prose-article min-h-[420px] w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-violet-500/40"
          />
        </div>
      </div>
    );
  },
);

export default RichTextEditor;

function ToolBtn({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      // Keep the editor's text selection when a toolbar button is pressed.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="min-w-[32px] h-8 px-2 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-white/5 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-white/10 mx-0.5" />;
}
