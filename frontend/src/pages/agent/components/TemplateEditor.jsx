import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../hooks/use-toast';

export const TemplateEditor = ({ value, onChange, onSave }) => {
  const { toast } = useToast();
  const [draft, setDraft] = React.useState(value || { name: '', tags: '', body: '' });

  React.useEffect(() => setDraft(value || { name: '', tags: '', body: '' }), [value]);

  const handleSave = () => {
    onSave?.(draft);
    toast({ title: 'Template saved' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Template name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
          <Input placeholder="Tags (comma separated)" value={draft.tags} onChange={e => setDraft({ ...draft, tags: e.target.value })} />
          <Textarea rows={10} placeholder="Message body" value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} />
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{draft.name || 'Untitled'}</h3>
            {draft.tags?.split(',').filter(Boolean).slice(0, 4).map((t, i) => (
              <Badge key={i} variant="secondary">{t.trim()}</Badge>
            ))}
          </div>
          <div className="rounded-md bg-muted p-4 whitespace-pre-wrap text-sm">
            {draft.body || 'Start typing your template message…'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


