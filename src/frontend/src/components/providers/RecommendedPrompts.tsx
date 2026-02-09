import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface RecommendedPromptsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export default function RecommendedPrompts({ prompts, onSelectPrompt }: RecommendedPromptsProps) {
  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Lightbulb className="h-5 w-5" />
          Recommended Prompts
        </CardTitle>
        <CardDescription className="text-sm">
          Click any prompt to insert it into the command box for editing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto justify-start whitespace-normal text-left text-sm"
              onClick={() => onSelectPrompt(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
