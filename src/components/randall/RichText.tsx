import type { ReactNode } from 'react';

/**
 * Convierte el texto de Randall en elementos React de forma segura (sin HTML crudo):
 * enlaces [texto](href), **negritas**, URLs, correos y listas con "- ".
 * Solo se permiten anclas internas (#seccion), https: y mailto:.
 */
const TOKEN =
    /\[([^\]]{1,80})\]\(([^)\s]{1,300})\)|\*\*([^*]{1,120})\*\*|(https:\/\/[^\s)]{1,300})|([\w.+-]{1,64}@[\w-]{1,63}\.[\w.]{2,24})/g;

const safeHref = (href: string): string | null => {
    if (/^#[a-z0-9-]{1,40}$/i.test(href)) return href;
    if (/^https:\/\//i.test(href)) return href;
    if (/^mailto:[\w.+-]+@[\w.-]+$/i.test(href)) return href;
    return null;
};

interface Props {
    text: string;
    /** Se llama al pulsar un ancla interna (#seccion). */
    onAnchor?: () => void;
    linkClassName?: string;
}

function renderInline(line: string, keyBase: string, props: Props): ReactNode[] {
    const out: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(line))) {
        if (m.index > last) out.push(line.slice(last, m.index));
        const key = `${keyBase}-${m.index}`;
        const [, label, href, bold, url, email] = m;
        const link = (h: string | null, text: string) => {
            if (!h) return text;
            const internal = h.startsWith('#');
            return (
                <a
                    key={key}
                    href={h}
                    className={props.linkClassName}
                    onClick={internal ? props.onAnchor : undefined}
                    {...(h.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                    {text}
                </a>
            );
        };
        if (label !== undefined) out.push(link(safeHref(href), label));
        else if (bold !== undefined) out.push(<strong key={key}>{bold}</strong>);
        else if (url !== undefined) out.push(link(safeHref(url), url.replace(/^https:\/\/(www\.)?/, '')));
        else if (email !== undefined) out.push(link(`mailto:${email}`, email));
        last = m.index + m[0].length;
    }
    if (last < line.length) out.push(line.slice(last));
    return out;
}

export const RichText = (props: Props) => {
    const lines = props.text.split('\n').map((l) => l.trimEnd()).filter((l, i, arr) => l || (i > 0 && arr[i - 1]));
    const blocks: ReactNode[] = [];
    let list: ReactNode[] = [];

    const flushList = (key: string) => {
        if (list.length) blocks.push(<ul key={key}>{list}</ul>);
        list = [];
    };

    lines.forEach((line, i) => {
        const item = /^\s*(?:[-•*]|\d+[.)])\s+(.*)$/.exec(line);
        if (item) {
            list.push(<li key={`li-${i}`}>{renderInline(item[1], `li-${i}`, props)}</li>);
            return;
        }
        flushList(`ul-${i}`);
        if (line) blocks.push(<p key={`p-${i}`}>{renderInline(line, `p-${i}`, props)}</p>);
    });
    flushList('ul-end');
    return <>{blocks}</>;
};
