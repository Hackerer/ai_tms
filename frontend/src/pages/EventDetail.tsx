import {
    ArrowLeft,
    History,
    Database,
    Code,
    Info,
    Copy,
    ChevronRight,
    User,
    Clock,
    CheckCircle2,
    DatabaseZap,
    Plus,
    Layers,
    Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUI } from '../context/UIContext';

// --- Sub-components for Tabs ---

const BasicInfoTab = ({ params, paramSearch, setParamSearch }: any) => {
    const filteredParams = params.filter((p: any) =>
        p.key.toLowerCase().includes(paramSearch.toLowerCase()) ||
        p.desc.toLowerCase().includes(paramSearch.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-standard p-6">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-primary" />
                        核心元数据
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">事件类型</span>
                            <span className="text-sm font-medium">点击事件 (Click)</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">所属业务域</span>
                            <span className="text-sm font-medium text-primary">交易链路 / 购物车</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">负责人 (Owner)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">A</div>
                                <span className="text-sm font-medium">Alex Chen</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-muted-foreground">应用范围</span>
                            <div className="flex gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-muted/10 border border-border">iOS</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-muted/10 border border-border">Android</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-standard p-6">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <DatabaseZap className="w-3.5 h-3.5 text-primary" />
                        上报约束
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "该事件用于统计用户在“购物车”页面点击“去结算”按钮的行为。上报时需确保已获取到当前的购物车商品列表快照。"
                    </p>
                    <div className="mt-6 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-green-500/20 text-green-400">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-green-400">数据质量: 卓越</p>
                                <p className="text-[10px] text-green-400/70 mt-0.5">该资产已完成元数据补齐，且现网数据校验通过率 99.8%。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-standard overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-white/[0.02] flex justify-between items-center">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        参数 Schema ({filteredParams.length})
                    </h4>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="搜索参数..."
                            value={paramSearch}
                            onChange={(e) => setParamSearch(e.target.value)}
                            className="bg-muted/10 border border-border rounded-lg pl-8 pr-3 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/50 w-40 transition-all text-foreground"
                        />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/[0.01] border-b border-border">
                            <th className="px-6 py-3 text-[10px] font-bold uppercase text-muted-foreground">参数键名 (Key)</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase text-muted-foreground">类型</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase text-muted-foreground">业务说明</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase text-muted-foreground text-center">示例值</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 font-mono text-xs">
                        {filteredParams.map((p: any, i: number) => (
                            <tr key={i} className="hover:bg-muted/5">
                                <td className="px-6 py-3 font-semibold text-foreground">{p.key}</td>
                                <td className="px-6 py-3">
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[9px] font-bold",
                                        p.type === 'NUMBER' ? "bg-green-500/10 text-green-400 border border-green-500/10" : "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                                    )}>
                                        {p.type}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-muted-foreground">{p.desc}</td>
                                <td className="px-6 py-3 text-muted-foreground text-center">{p.example}</td>
                            </tr>
                        ))}
                        {filteredParams.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic text-xs">
                                    未搜索到匹配参数...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ChangeLogsTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
        {[
            { ver: 'v2.1', date: '2025-12-30', req: 'REQ-01', type: 'EDIT', desc: '根据治理要求，新增 coupon_code 参数以支持优惠券漏斗分析。', user: 'Alex Chen' },
            { ver: 'v2.0', date: '2025-11-15', req: 'REQ-99', type: 'EDIT', desc: '修正 price 类型为 NUMBER，统一后端计算口径。', user: 'Sarah Zhao' },
            { ver: 'v1.0', date: '2025-10-01', req: 'REQ-88', type: 'NEW', desc: '事件初稿创建，由交易链路组提交。', user: 'Mike Sun' },
        ].map((log, i) => (
            <div key={i} className="relative pl-8 group">
                {i !== 2 && <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%+24px)] bg-border" />}
                <div className={cn(
                    "absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center z-10 shadow-sm",
                    log.type === 'NEW' ? "bg-green-500" : "bg-primary"
                )}>
                    {log.type === 'NEW' ? <Plus className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}
                </div>
                <div className="card-standard p-5 hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold tracking-tight">{log.ver}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{log.date}</span>
                            <div className="px-2 py-0.5 rounded bg-muted/10 border border-border text-[9px] text-primary font-bold">关联需求: {log.req}</div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <User className="w-3 h-3" />
                            {log.user}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{log.desc}</p>
                </div>
            </div>
        ))}
    </div>
);

const SqlTemplatesTab = () => {
    const { showToast } = useUI();
    const sql = `-- TMS 子查询模板 (Hive / Starrocks)
SELECT 
  event_name,
  COALESCE(get_json_object(properties, '$.item_id'), '') AS item_id,
  CAST(get_json_object(properties, '$.price') AS DOUBLE) AS price,
  dt
FROM 
  dwd_tms_event_log
WHERE 
  event_name = 'cart_add_click'
  AND dt >= '{{ds}}'
LIMIT 100;`;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="card-standard overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-white/[0.02] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-bold">数仓分析模板 (SQL)</h4>
                    </div>
                    <button
                        onClick={() => { navigator.clipboard.writeText(sql); showToast('SQL 模板已复制', 'success'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/10 transition-colors text-xs text-muted-foreground"
                    >
                        <Copy className="w-3.5 h-3.5" />
                        复制模板
                    </button>
                </div>
                <div className="p-6 bg-muted/20 font-mono text-sm leading-relaxed text-blue-400">
                    <pre className="overflow-x-auto whitespace-pre-wrap">{sql}</pre>
                </div>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    提示：字段解析逻辑基于最新版本资产 Schema 生成。如果历史数据包含旧版参数，建议使用 `json_extract` 进行兼容处理。
                </p>
            </div>
        </div>
    );
};

const SdkIntegrationTab = () => {
    const { showToast } = useUI();
    const [platform, setPlatform] = useState('js');

    const codes: any = {
        js: `// Web SDK Integration
nexus.track('cart_add_click', {
  item_id: 'PRODUCT_ID',
  price: 0.0,
  coupon_id: 'OPTIONAL_VALUE'
});`,
        swift: `// iOS SDK Integration
Nexus.shared.track("cart_add_click", properties: [
  "item_id": "PRODUCT_ID",
  "price": 0.0,
  "coupon_id": "OPTIONAL_VALUE"
])`,
        kotlin: `// Android SDK Integration
Nexus.track("cart_add_click", mapOf(
  "item_id" to "PRODUCT_ID",
  "price" to 0.0,
  "coupon_id" to "OPTIONAL_VALUE"
))`
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex gap-2">
                {['js', 'swift', 'kotlin'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                            platform === p
                                ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                : "bg-muted/10 border-border text-muted-foreground hover:bg-muted/20"
                        )}
                    >
                        {p === 'js' ? 'JavaScripts' : p === 'swift' ? 'iOS (Swift)' : 'Android (Kotlin)'}
                    </button>
                ))}
            </div>

            <div className="card-standard overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-white/[0.02] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-bold">SDK 调用方法</h4>
                    </div>
                    <button
                        onClick={() => { navigator.clipboard.writeText(codes[platform]); showToast('代码已复制到剪贴板', 'success'); }}
                        className="p-1.5 hover:bg-muted/10 rounded-lg text-muted-foreground"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 bg-muted/20 font-mono text-xs leading-relaxed text-purple-400">
                    <pre className="overflow-x-auto whitespace-pre-wrap">{codes[platform]}</pre>
                </div>
            </div>
        </div>
    );
};

// --- Main Detail Page ---

export const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('basic');
    const [paramSearch, setParamSearch] = useState('');

    const params = [
        { key: 'item_id', type: 'STRING', desc: '商品唯一识别码', example: '"P-1002"' },
        { key: 'price', type: 'NUMBER', desc: '结算单元格价格', example: '19.9' },
        { key: 'coupon_id', type: 'STRING', desc: '促销活动 ID', example: '"SALE_2025"' },
        { key: 'platform', type: 'STRING', desc: '终端类型 (WEB/APP)', example: '"iOS"' },
    ];

    const tabs = [
        { id: 'basic', label: '基本信息', icon: Info },
        { id: 'logs', label: '变更历史', icon: History },
        { id: 'sql', label: '分析 SQL', icon: Database },
        { id: 'sdk', label: '开发集成', icon: Code },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {/* Header */}
            <div className="h-20 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/assets')}
                        className="p-2.5 hover:bg-muted/10 rounded-full text-muted-foreground hover:text-foreground transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-extrabold tracking-tight">cart_add_click</h2>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Online</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5 tracking-tight uppercase">
                            PID: 1042 • Type: Tracking Event • ID: {id}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/10 border border-border text-xs font-bold hover:bg-muted/20 transition-colors">
                        历史快照
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white text-xs font-extrabold shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:brightness-110 active:scale-95 transition-all">
                        申请变更
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tabs Switcher */}
            <div className="px-8 bg-background/50 border-b border-border flex items-center h-14 backdrop-blur-sm sticky top-20 z-10">
                <div className="flex h-full gap-10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative flex items-center gap-2 h-full text-xs font-extrabold transition-all group",
                                    activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-4 h-4 group-hover:scale-110 transition-transform", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-[-10%] right-[-10%] h-0.5 bg-primary shadow-[0_-4px_15px_rgba(59,130,246,0.8)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-auto p-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'basic' && (
                        <BasicInfoTab
                            params={params}
                            paramSearch={paramSearch}
                            setParamSearch={setParamSearch}
                        />
                    )}
                    {activeTab === 'logs' && <ChangeLogsTab />}
                    {activeTab === 'sql' && <SqlTemplatesTab />}
                    {activeTab === 'sdk' && <SdkIntegrationTab />}
                </div>
            </div>
        </div>
    );
};
