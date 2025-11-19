import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Badge } from '../../components/ui/badge';
import { AgentLayout } from './AgentLayout';
import { storage } from './utils';
import { Plus, FileText, Zap, Search, Tag, Save, Eye, Sparkles, MessageSquare, Copy } from 'lucide-react';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const KEY = 'agent.templates';
const seed = [
  { id: 'tmp-1', name: 'Refund approved', tags: 'refund, resolution', body: 'Dear {{customer_name}}, your refund for order {{order_id}} amount {{amount}} has been approved. Best, {{agent_name}}' },
  { id: 'tmp-2', name: 'Request more information', tags: 'info', body: 'Hi {{customer_name}}, could you share more details or a screenshot so we can help faster? — {{agent_name}}' }
];

const quickSnippets = [
  { label: 'Refund approved', text: 'We have approved your refund for order {{order_id}}.' },
  { label: 'Refund rejected', text: 'Unfortunately, your refund request for order {{order_id}} was not approved.' },
  { label: 'Order delay', text: 'There is a slight delay with your order. It should ship soon.' },
  { label: 'Replacement offer', text: 'We are offering a replacement item for your order.' },
  { label: 'Request info', text: 'Could you provide more info regarding your issue?' },
  { label: 'Polite closing', text: 'Let us know if there is anything else we can do!' }
];

const customizableSections = [
  { label: 'Greeting', text: 'Hi {{customer_name}},' },
  { label: 'Reason/Context', text: 'We wanted to follow up regarding your recent support request.' },
  { label: 'Resolution Details', text: 'Here are the actions we are taking to resolve your issue: ...' },
  { label: 'Next Steps', text: 'Next, please ...' },
  { label: 'Closing', text: 'Thank you for reaching out to us.' }
];

const tagList = ['All', 'Refund', 'Delay', 'Replacement', 'Info'];

export const ResponseTemplates = () => {
  const [templates, setTemplates] = useState(() => storage.get(KEY, seed));
  const [selected, setSelected] = useState(templates[0]);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('All');
  const [showNew, setShowNew] = useState(false);
  const textareaRef = useRef();

  const save = (draft) => {
    const updated = draft?.id
      ? templates.map(t => (t.id === draft.id ? draft : t))
      : [...templates, { ...draft, id: `tmp-${Date.now()}` }];
    setTemplates(updated);
    storage.set(KEY, updated);
    setSelected({ ...draft, id: draft?.id || `tmp-${Date.now()}` });
  };

  const startNewTemplate = () => {
    setShowNew(true);
    setSelected({ name: '', tags: '', body: '' });
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Filter templates
  const filtered = templates.filter(t => {
    const matchesTag = tag === 'All' || (t.tags || '').toLowerCase().includes(tag.toLowerCase());
    const matchesQuery = [t.name, t.tags, t.body].join(' ').toLowerCase().includes(query.toLowerCase());
    return matchesTag && matchesQuery;
  });


  const insertAtCursor = (text) => {
    if (!textareaRef.current) {
      setSelected(sel => ({ ...sel, body: (sel.body ? sel.body + '\n' : '') + text }));
      return;
    }
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = selected.body?.slice(0, start) || '';
    const after = selected.body?.slice(end) || '';
    const body = before + text + after;
    setSelected(sel => ({ ...sel, body }));
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + text.length;
    }, 0);
  };

  return (
    <AgentLayout>
      <div className="space-y-8">
      {/*Header */}
      <div className="relative overflow-hidden rounded-xl p-1 shadow-lg" style={{background: 'white'}}>
        <div className="rounded-lg bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Response Templates</h1>
              <p className="text-sm text-muted-foreground">Create and manage response templates</p>
            </div>
          </div>
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-md hover:shadow-lg transition-all" onClick={startNewTemplate}>
            <Plus className="h-5 w-5" /> New Template
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-8 animate-slide-in-up">
        {/* Left column: quick insert */}
        <Card className="shadow-lg border-2 border-primary/10">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Zap className="h-5 w-5" />
              Insert Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <label className="font-semibold mb-3 block flex items-center gap-2 text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                Customizable Sections
              </label>
              <div className="grid grid-cols-1 gap-2">
                {customizableSections.map(({label, text}, idx) => (
                  <Button 
                    key={label} 
                    variant="outline" 
                    className="w-full text-left justify-between hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all group" 
                    type="button" 
                    onClick={() => insertAtCursor(text)}
                  >
                    <span>{label}</span>
                    <span className="text-muted-foreground group-hover:text-primary">+ Insert</span>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-semibold mb-3 block flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                Quick Insert
              </label>
              <div className="flex flex-wrap gap-2">
                {quickSnippets.map((q, idx) => (
                  <Button 
                    key={q.label} 
                    variant="secondary" 
                    size="sm" 
                    type="button" 
                    onClick={() => insertAtCursor(q.text)}
                    className="bg-accent/20 hover:bg-accent/30 text-accent border-accent/40 hover:border-accent/60 border font-medium shadow-sm transition-all"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {q.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Center: editor and preview stacked */}
        <Card className="shadow-lg border-2 border-primary/10">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              Message Body
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Textarea
              ref={textareaRef}
              className="resize-none h-56 border-2 focus:border-primary transition-colors"
              placeholder="Start typing your message template here... Use {{variables}} for dynamic content."
              value={selected?.body || ''}
              onChange={e => setSelected(sel => ({ ...sel, body: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => save(selected)}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(selected?.body || '');
                  toast.success('Copied to clipboard!');
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-md mb-2 flex items-center gap-2 text-primary">
                <Eye className="h-4 w-4" />
                Live Preview
              </div>
              <div className="rounded-lg border-2 border-primary/20 p-4 bg-gradient-to-br from-muted/50 to-muted/30 whitespace-pre-wrap text-sm text-foreground min-h-[80px] shadow-inner">
                {selected?.body || <span className="text-muted-foreground italic">Nothing to preview. Start typing above...</span>}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Right: Template filter, search, and list */}
        <Card className="shadow-lg border-2 border-accent/10">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent border-b">
            <CardTitle className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-accent">
                <FileText className="h-5 w-5" />
                Templates
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or keyword"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-10 border-2 focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tagList.map(t => (
                <Button
                  key={t}
                  variant={tag === t ? 'default' : 'outline'}
                  size="sm"
                  className={tag === t 
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md font-semibold' 
                    : 'text-muted-foreground hover:border-primary/50 hover:text-primary'}
                  style={{minWidth: 80}}
                  onClick={() => setTag(t)}>
                  <Tag className="h-3 w-3 mr-1" />
                  {t}
                </Button>
              ))}
            </div>
            <ScrollArea className="h-[340px] pr-0">
              <div className="space-y-2 max-w-full">
                {filtered.map(t => (
                  <button key={t.id}
                    className={`w-64 text-left rounded-lg border-2 shadow-sm bg-background overflow-hidden p-3 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:border-primary/50 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col gap-1 group ${selected?.id === t.id ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary ring-2 ring-primary/30 shadow-md' : 'border-border'}`}
                    style={{minHeight:48, maxWidth: '100%'}}
                    onClick={() => { setSelected(t); setShowNew(false); }}>
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <div className="flex items-center min-w-0 gap-1">
                        <span className="truncate font-medium text-base leading-snug max-w-[100%]">{t.name}</span>
                        <div className="flex flex-wrap items-center gap-1 min-w-0 max-w-[40%]">
                          {t.tags?.split(',').map(tag => (
                            <Badge key={tag.trim()} variant="secondary" className="capitalize whitespace-nowrap max-w-24 truncate" style={{fontSize:'0.85em'}}>{tag.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-1 pl-0.5 pr-0.5 text-sm text-muted-foreground leading-tight min-w-0" style={{ display: 'webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '2.5em', whiteSpace: 'pre-line' }}>
                        {t.body}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="text-xs text-muted-foreground pt-2">Templates shown: {filtered.length}</div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
    </AgentLayout>
  );
};


