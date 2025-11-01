import React from 'react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';

export const MessageComposer = ({ type = 'email', defaults = {}, onSend }) => {
  const { toast } = useToast();
  const [state, setState] = React.useState({ to: '', subject: '', body: '', ...defaults });

  const send = () => {
    onSend?.(state);
    toast({ title: type === 'email' ? 'Email queued' : 'WhatsApp message queued' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{type} Composer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder={type === 'email' ? 'Recipient email' : 'Recipient number'} value={state.to} onChange={e => setState({ ...state, to: e.target.value })} />
        {type === 'email' ? (
          <Input placeholder="Subject" value={state.subject} onChange={e => setState({ ...state, subject: e.target.value })} />
        ) : null}
        <Textarea rows={6} placeholder="Message body" value={state.body} onChange={e => setState({ ...state, body: e.target.value })} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setState({ to: '', subject: '', body: '' })}>Clear</Button>
          <Button onClick={send}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
};


