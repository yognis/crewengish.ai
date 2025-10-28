"use client";

export function ChatTokenPreview() {
  return (
    <div className="space-y-chat">
      <div className="max-w-sm rounded-bubble border border-chat-ai-border bg-chat-ai p-4 text-chat-ai-text shadow-sm">
        AI örnek mesajı: Merhaba, sınavınız için nasıl yardımcı olabilirim?
      </div>
      <div className="ml-auto max-w-sm rounded-bubble bg-chat-user p-4 text-chat-user-text shadow-sm">
        Kullanıcı mesajı: İlk soruya hazırım.
      </div>
    </div>
  );
}
