import type { Translations } from './types';

export const ja: Translations = {
  // Core App
  title: 'フォトブース',
  description:
    'ステッカー付きの写真を撮影、カウントダウンストリップを作成、またはタイマーストリップをキャプチャしましょう！',
  camera: 'カメラ',
  edit: '編集',
  strip: 'ストリップ',
  gallery: 'ギャラリー',
  chooseLayout: 'レイアウトを選択:',
  takePhoto: '写真を撮る',
  countdownStrip: 'カウントダウンストリップ',
  timedStrip: 'タイマーストリップ',
  stickers: 'ステッカー:',
  takeNewPhoto: '新しい写真を撮る',
  saveToGallery: 'ギャラリーに保存',
  download: 'ダウンロード',
  downloading: 'ダウンロード中...',
  saving: '保存中...',
  takeNewStrip: '新しいストリップを撮る',
  downloadStrip: 'ストリップをダウンロード',
  galleryEmpty: 'ギャラリーは空です。写真を撮ってください！',
  view: '表示',
  delete: '削除',
  processing: '処理中...',
  createMoment: 'しばらくお待ちください',
  nextPhotoIn: '次の写真まで',
  photoComplete: '写真完了！',
  stripComplete: 'ストリップ完了！',
  errorTitle: 'エラー',
  errorDescription: '問題が発生しました。もう一度お試しください。',
  cameraError: 'カメラにアクセスできません。カメラの許可を与えたことを確認してください。',
  photoSaved: '写真がギャラリーに保存されました。',
  photoDeleted: '写真がギャラリーから削除されました。',
  downloadStarted: '写真がダウンロード中です。',
  timedCaptureStarted: '枚の写真、5秒ごとに1枚。',
  photos: '枚',
  photo: '枚',

  // Navigation
  backToPhotoBooth: 'フォトブースに戻る',

  // Support Page
  supportCenter: 'サポートセンター',
  supportDescription: 'フォトブースアプリのサポートを受ける',
  faqTitle: 'よくある質問',
  contactForm: 'お問い合わせフォーム',
  contactFormDescription: 'メッセージをお送りください。可能な限り迅速に回答いたします。',
  contactDirect: '直接メール',
  contactDirectDescription: 'メールをご希望ですか？直接お問い合わせください。',
  yourName: 'お名前',
  yourEmail: 'メールアドレス',
  subject: '件名',
  message: 'メッセージ',
  send: 'メッセージを送信',
  sending: '送信中...',
  emailSent: 'メッセージが正常に送信されました！すぐに返信いたします。',
  emailError:
    'メッセージの送信中にエラーが発生しました。もう一度お試しいただくか、直接メールオプションをご利用ください。',
  emailRequired: 'メールアドレスが必要です',
  messageRequired: 'メッセージが必要です',
  nameRequired: '名前が必要です',
  subjectRequired: '件名が必要です',
  directEmail: '直接メールを送信',

  // FAQ Items
  faqQuestion1: '写真を撮るにはどうすればよいですか？',
  faqAnswer1:
    'ナビゲーションのカメラアイコンをクリックし、カメラを自分や被写体に向けて、「写真を撮る」ボタンをクリックします。写真を撮る前後にステッカーを追加できます。',
  faqQuestion2: '写真にステッカーを追加するにはどうすればよいですか？',
  faqAnswer2:
    '写真を撮った後、利用可能なステッカーを閲覧し、特定のものを検索して、写真にドラッグできます。マウスホイールやリセットボタンを使ってステッカーのサイズを変更できます。',
  faqQuestion3: '写真をダウンロードするにはどうすればよいですか？',
  faqAnswer3:
    '写真を撮って編集したら、「ダウンロード」ボタンをクリックしてデバイスに保存します。フォトストリップの場合は、「ストリップをダウンロード」ボタンを使用します。',
  faqQuestion4: 'モバイルデバイスで使用できますか？',
  faqAnswer4:
    'はい！このフォトブースアプリは完全にレスポンシブで、モバイルデバイス、タブレット、デスクトップコンピューターで素晴らしく動作します。',
  faqQuestion5: 'データは安全でプライベートですか？',
  faqAnswer5:
    '絶対に。すべての写真はブラウザーでローカルに処理され、サーバーにアップロードされることはありません。あなたのプライバシーが私たちの優先事項です。',

  // Privacy Page
  privacyPolicy: 'プライバシーポリシー',
  privacyLastUpdated: '最終更新日：2025年6月13日',
  privacyIntro:
    'このプライバシーポリシーは、フォトブース（「私たち」、「当社」、または「我々」）がフォトブースWebアプリケーションを使用する際に情報を収集、使用、保護する方法について説明します。',
  privacyInfoCollection: '収集する情報',
  privacyInfoCollectionText:
    'アプリが機能するために必要な最小限の情報を収集します。これには写真撮影のためのカメラアクセスと、お問い合わせフォームを通じて自発的に提供される情報が含まれます。',
  privacyInfoUse: '情報の使用方法',
  privacyInfoUseText:
    'カメラデータはブラウザー内での写真撮影と処理のためのみに使用されます。写真を外部サーバーに保存、アップロード、送信することはありません。',
  privacyDataStorage: 'データストレージ',
  privacyDataStorageText:
    'すべての写真と編集はブラウザーでローカルに処理されます。当社のサーバーに写真を保存することはありません。ギャラリー内の写真はデバイスにローカルに保存されます。',
  privacyThirdParty: 'サードパーティサービス',
  privacyThirdPartyText:
    'ウェブサイトの分析とお問い合わせフォームの処理にサードパーティサービスを使用する場合があります。これらのサービスには独自のプライバシーポリシーがあります。',
  privacyUserRights: 'あなたの権利',
  privacyUserRightsText:
    'いつでもローカル写真ギャラリーをクリアする権利があります。ブラウザー設定からカメラ許可を取り消すこともできます。',
  privacyChanges: 'このポリシーの変更',
  privacyChangesText:
    'このプライバシーポリシーを随時更新する場合があります。このページに新しいプライバシーポリシーを投稿することで変更をお知らせします。',
  privacyContact: 'お問い合わせ',
  privacyContactText:
    'このプライバシーポリシーについてご質問がございましたら、サポートページからお問い合わせください。',

  // Terms Page
  termsOfService: '利用規約',
  termsLastUpdated: '最終更新日：2025年6月13日',
  termsIntro:
    'フォトブースへようこそ！この利用規約（「規約」）は、フォトブースWebアプリケーションの使用を規定します。',
  termsAcceptance: '規約の受諾',
  termsAcceptanceText:
    'このアプリケーションにアクセスして使用することにより、この契約の条件と規定に拘束されることに同意し、承諾します。',
  termsUse: '使用ライセンス',
  termsUseText:
    '個人的、非商用の一時的な閲覧のみを目的として、このアプリケーションを一時的に使用する許可が与えられます。',
  termsContent: 'コンテンツ',
  termsContentText:
    'このアプリケーションを使用して作成した写真のすべての権利を保持します。コンテンツの所有権を主張することはありません。',
  termsPrivacy: 'プライバシー',
  termsPrivacyText:
    'あなたのプライバシーは重要です。アプリケーションの使用も規定するプライバシーポリシーをご確認ください。',
  termsLimitations: '制限',
  termsLimitationsText:
    'いかなる場合でも、フォトブースまたはそのサプライヤーは、このアプリケーションの使用または使用不能から生じる損害について責任を負いません。',
  termsModifications: '改訂とエラータ',
  termsModificationsText:
    'これらの利用規約を予告なくいつでも改訂する場合があります。このアプリケーションを使用することにより、これらの規約の現在のバージョンに拘束されることに同意します。',
  termsGoverning: '準拠法',
  termsGoverningText: 'これらの条件は適用法に従って規定され、解釈されます。',
  termsContactInfo: '連絡先情報',
  termsContactInfoText:
    'この利用規約についてご質問がございましたら、サポートページからお問い合わせください。',
};
