"use client";

import { useState } from "react";
import { MessageSquare, PhoneCall, Send, Smartphone, X } from "lucide-react";
import { Tabs, TabsList, TabsPanel, TabsTab } from "./ui/tabs";
import Dialog from "./Dialog";
import { IconButton } from "./ui";

export default function LowDataAccessDialog({ profile, onClose, onSend }) {
  const [channel, setChannel] = useState("sms");
  const [phone, setPhone] = useState(profile.phone);
  const [ussdOpen, setUssdOpen] = useState(false);

  function send(event) {
    event?.preventDefault();
    if (channel === "sms") onSend("SMS request sent", `Queue options will be sent to ${phone || "your mobile"}.`);
    if (channel === "whatsapp") onSend("WhatsApp demo opened", "Nearby queues and reply options are ready in the chat preview.");
  }

  return (
    <Dialog
      layerClassName="sheet-layer access-layer"
      sectionClassName="access-dialog"
      labelledBy="access-title"
      onClose={onClose}
    >
      <header><div><p className="eyebrow">LOW-DATA ACCESS</p><h2 id="access-title">QueueLess on any phone</h2></div><IconButton label="Close low-data access" onClick={onClose}><X size={19} /></IconButton></header>

      <Tabs value={channel} onValueChange={setChannel}>
        <TabsList className="access-tabs" aria-label="Access channels">
          <TabsTab value="sms">SMS</TabsTab>
          <TabsTab value="whatsapp">WhatsApp</TabsTab>
          <TabsTab value="ussd">USSD</TabsTab>
        </TabsList>

        <TabsPanel value="sms">
          <form className="channel-demo" onSubmit={send}>
            <span className="channel-icon"><Smartphone size={24} /></span>
            <h3>Get nearby queues by SMS</h3>
            <p>Send <b>QUEUE + suburb</b>. The prototype returns the three shortest waits and numbered reply options.</p>
            <label><span>Mobile number</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" required /></label>
            <div className="message-preview"><small>PREVIEW</small><p>QueueLess: Randburg HA 18m. Ferndale Clinic 11m. Ubuntu Bank 26m. Reply 1, 2 or 3 to join.</p></div>
            <button className="primary-button full" type="submit"><Send size={18} /> Send demo SMS</button>
          </form>
        </TabsPanel>
        <TabsPanel value="whatsapp">
          <div className="channel-demo">
            <span className="channel-icon whatsapp"><MessageSquare size={24} /></span>
            <h3>WhatsApp queue assistant</h3>
            <p>People can share a suburb, choose a service, join, and receive leave-now alerts in a familiar conversation.</p>
            <div className="chat-preview"><span>Hi QueueLess, find Home Affairs near Randburg.</span><span>Randburg Home Affairs is 18 min. Reply JOIN to reserve your place.</span></div>
            <button className="primary-button full" onClick={send}><MessageSquare size={18} /> Open demo conversation</button>
          </div>
        </TabsPanel>
        <TabsPanel value="ussd">
          <div className="channel-demo">
            <span className="channel-icon ussd"><PhoneCall size={24} /></span>
            <h3>Works without mobile data</h3>
            <p>Dial <b>*120*7537#</b> from any mobile phone.</p>
            {ussdOpen
              ? <div className="ussd-screen"><strong>QueueLess SA</strong><span>1. Find nearby services</span><span>2. Check my queue</span><span>3. Leave a queue</span><button onClick={() => onSend("USSD selection received", "Nearby service options were returned in the demo session.")}>Choose 1 · Find services</button></div>
              : <button className="primary-button full" onClick={() => setUssdOpen(true)}><PhoneCall size={18} /> Dial demo code</button>}
          </div>
        </TabsPanel>
      </Tabs>
    </Dialog>
  );
}
