import { listMessages } from "@/lib/queries";
import { deleteMessageAction, markMessageAction } from "../../actions";

export default async function Messages() {
  const list = await listMessages();
  const unread = list.filter((m) => !m.read).length;
  return (
    <div className="adm-page narrow">
      <header className="adm-head"><div><p className="adm-eyebrow">Client care</p><h1>Messages {unread > 0 && <span className="pill paid">{unread} new</span>}</h1></div></header>
      {!list.length && <p className="adm-muted">No messages yet. Anything sent from the store&apos;s contact page arrives here.</p>}
      <div className="msgs">
        {list.map((m) => (
          <article key={m.id} className={`adm-card msg${m.read ? "" : " unread"}`}>
            <div className="msg-h">
              <div><b>{m.name}</b> <a className="adm-link" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}>{m.email}</a></div>
              <span className="adm-muted sm">{new Date(m.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <p className="msg-s">{m.subject}</p>
            <p className="msg-b">{m.body}</p>
            <div className="msg-a">
              <form action={markMessageAction}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="read" value={m.read ? "0" : "1"} /><button className="adm-link">{m.read ? "Mark unread" : "Mark as read"}</button></form>
              <a className="adm-link" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}>Reply by email</a>
              <form action={deleteMessageAction}><input type="hidden" name="id" value={m.id} /><button className="adm-link red">Delete</button></form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
