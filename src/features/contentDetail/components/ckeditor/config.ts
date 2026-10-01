// CKEditor 5 のプラグイン・ツールバー・HTML 保持ルールなどの設定。
// 遅延読み込みのエディタモジュールからのみ参照され、初期表示の bundle には含まれない。
import {
  Alignment,
  Bold,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  HtmlComment,
  Image,
  Italic,
  Link,
  List,
  Paragraph,
  RemoveFormat,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
  type EditorConfig,
} from 'ckeditor5';
import jaTranslations from 'ckeditor5/translations/ja.js';
import 'ckeditor5/ckeditor5.css';

export const EDITOR_CONFIG: EditorConfig = {
  // TODO: 商用利用の場合は正式なライセンスキーに置き換える
  licenseKey: 'GPL',
  language: 'ja',
  translations: [jaTranslations],
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    RemoveFormat,
    FontSize,
    FontFamily,
    FontColor,
    FontBackgroundColor,
    Alignment,
    List,
    Link,
    Image,
    Table,
    TableToolbar,
    HorizontalLine,
    GeneralHtmlSupport,
    HtmlComment,
  ],
  toolbar: [
    'undo', 'redo', '|',
    'heading', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
    'bold', 'italic', 'underline', 'strikethrough', 'removeFormat', '|',
    'alignment', 'bulletedList', 'numberedList', '|',
    'link', 'insertTable', 'horizontalLine',
  ],
  table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
  // 既存 HTML の id / class / style などを保持する。イベント属性（on*）は許可しない
  htmlSupport: {
    allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
    disallow: [{ attributes: [{ key: /^on/i, value: true }] }],
  },
};
