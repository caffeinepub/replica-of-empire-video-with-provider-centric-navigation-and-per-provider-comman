import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface ChatMessageContentProps {
  content: string;
}

export default function ChatMessageContent({
  content,
}: ChatMessageContentProps) {
  // Detect URLs in the content
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return (
    <div className="whitespace-pre-wrap break-words">
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (part.match(urlRegex)) {
          const isZipUrl = part.toLowerCase().endsWith(".zip");

          if (isZipUrl) {
            return (
              <div
                key={`part-${index}-${part.slice(0, 10)}`}
                className="my-2 flex flex-col gap-2"
              >
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-fit gap-2"
                >
                  <a href={part} download>
                    <Download className="h-4 w-4" />
                    Download ZIP
                  </a>
                </Button>
                <span className="text-xs opacity-70 break-all">{part}</span>
              </div>
            );
          }

          // Regular URL
          return (
            <a
              key={`part-${index}-${part.slice(0, 10)}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
            >
              {part}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        }

        // Regular text
        return <span key={`part-${index}-${part.slice(0, 10)}`}>{part}</span>;
      })}
    </div>
  );
}
