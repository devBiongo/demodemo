import { ContentDetailPage } from "./features/contentDetail";

export default function App() {
  // TODO: 呼び出し元から渡す。現在はデバッグ用に approval（参照のみ）で固定
  return <ContentDetailPage mode="approval" />;
}
