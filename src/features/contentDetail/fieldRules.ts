import type { FieldRules } from "./utils/fieldControl";
import { sectionField } from "./utils/fieldPath";

/**
 * 画面項目の活性 / 非活性と、値のクリアを決める。入力値が変わるたびに呼ばれる。
 * - disable / enable：活性状態だけを変える（値はそのまま）。何も指定しない項目は活性
 * - clear / keep：値だけを空にする（活性状態とは無関係）。通常は changed で条件を付ける
 * - selectSection：コンテンツ画面のタブを選択する。通常は changed で条件を付ける
 * - 同じ項目に複数回指定した場合は、後から呼んだものが優先
 * - 親を指定すると配下すべて（例：'content' はコンテンツ画面の全項目）
 * - 非活性の項目は送信時の検証をしない
 */
export const fieldRules: FieldRules = ({ values, mode, changed }, field) => {
  const { content, attributes } = values;

  // システムが設定する項目
  field.disable(
    "url",
    "attributes.id",
    "attributes.registeredAt",
    "attributes.updatedAt",
    "attributes.creator",
    "attributes.updater",
  );

  // コンテンツ種別「お知らせ」→ コンテンツ画面は 1 つ目のタブの概要文以外を非活性
  if (attributes.contentType === "notice") {
    field.disable("content", "action.fileInsert");
    field.enable(sectionField(0, "summary"));
    // お知らせに切り替えた時点で、同じ範囲の値をクリアし、入力できる 1 つ目のタブを選択
    if (changed === "attributes.contentType") {
      field.clear("content");
      field.keep(sectionField(0, "summary"));
      field.selectSection(0);
    }
  }

  // 「ChatGPTを使用」→ 内容は自動生成するため入力不可
  if (content.titleKeywordUseAi) field.disable("content.titleKeyword");
  content.sections.forEach((s, i) => {
    if (s.summaryUseAi) field.disable(sectionField(i, "summary"));
    if (s.keywordsUseAi) field.disable(sectionField(i, "keywords"));
  });

  // 承認画面は参照のみ（最後に書く：これより前の enable もすべて上書き）
  if (mode === "approval") {
    field.disableAll();
    // 参照・画面操作のボタンは使える
    field.enable(
      "action.cancel",
      "action.preview",
      "action.fullscreen",
      "action.switchMode",
      "action.compare",
      "action.compareClose",
    );
    // TODO: 承認時に編集できる項目 → field.enable(...)
  }
};
