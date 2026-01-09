import React, { useState, useMemo } from 'react';
import { Copy, Check, Terminal, Code2, Cpu } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { TrackingEvent } from '../types/schema';

interface CodegenPreviewProps {
    events: TrackingEvent[];
    planName: string;
}

type Language = 'TypeScript' | 'Swift' | 'Kotlin';

export const CodegenPreview: React.FC<CodegenPreviewProps> = ({ events, planName }) => {
    const [activeLang, setActiveLang] = useState<Language>('TypeScript');
    const [isCopied, setIsCopied] = useState(false);

    const generateCode = useMemo(() => {
        if (events.length === 0) return '// No events defined to generate code.';

        const header = `/**\n * Generated code for: ${planName}\n * Date: ${new Date().toLocaleDateString()}\n */\n\n`;

        if (activeLang === 'TypeScript') {
            return header + events.map(event => {
                const interfaceName = event.identifier.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
                const params = event.parameters.map(p => {
                    const typeMap: Record<string, string> = {
                        'STRING': 'string',
                        'NUMBER': 'number',
                        'BOOLEAN': 'boolean',
                        'ENUM': p.enumValues ? p.enumValues.map(v => `'${v}'`).join(' | ') : 'string',
                        'OBJECT': 'Record<string, any>',
                        'ARRAY': 'any[]'
                    };
                    return `  ${p.identifier}${p.isRequired ? '' : '?'}: ${typeMap[p.type] || 'any'}; // ${p.name}`;
                }).join('\n');

                return `export interface ${interfaceName} {\n${params}\n}`;
            }).join('\n\n');
        }

        if (activeLang === 'Swift') {
            return header + events.map(event => {
                const structName = event.identifier.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
                const params = event.parameters.map(p => {
                    const typeMap: Record<string, string> = {
                        'STRING': 'String',
                        'NUMBER': 'Double',
                        'BOOLEAN': 'Bool',
                        'ENUM': 'String',
                        'OBJECT': '[String: Any]',
                        'ARRAY': '[Any]'
                    };
                    return `  let ${p.identifier}: ${typeMap[p.type] || 'Any'}${p.isRequired ? '' : '?'} // ${p.name}`;
                }).join('\n');

                return `struct ${structName}: Codable {\n${params}\n}`;
            }).join('\n\n');
        }

        return `// ${activeLang} support is coming soon...`;
    }, [events, activeLang, planName]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generateCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-foreground rounded-[32px] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                        {(['TypeScript', 'Swift', 'Kotlin'] as Language[]).map(lang => (
                            <button
                                key={lang}
                                onClick={() => setActiveLang(lang)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest",
                                    activeLang === lang
                                        ? "bg-white text-black shadow-lg"
                                        : "text-white/40 hover:text-white/70"
                                )}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/80 active:scale-95 border border-white/5"
                >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                        {isCopied ? 'Copied' : 'Copy Code'}
                    </span>
                </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-8 font-mono text-xs relative group custom-scrollbar">
                <pre className="text-white/90 selection:bg-primary/40 selection:text-white">
                    <code>{generateCode}</code>
                </pre>

                {/* Floating Indicators */}
                <div className="absolute top-6 right-8 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                    <Terminal className="w-12 h-12 text-white" />
                </div>
            </div>

            {/* Footer / Status */}
            <div className="px-6 py-3 bg-white/2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Codegen Engine Active</span>
                </div>
                <div className="flex items-center gap-3 text-white/20">
                    <Code2 className="w-3.5 h-3.5" />
                    <Cpu className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>
    );
};
