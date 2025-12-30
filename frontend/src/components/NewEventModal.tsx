import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';

interface Parameter {
    key: string;
    type: string;
    desc: string;
    isRequired: boolean;
}

export const NewEventModal = () => {
    const { closeModal, showToast } = useUI();
    const [name, setName] = useState('');
    const [type, setType] = useState('Click');
    const [page, setPage] = useState('首页');
    const [description, setDescription] = useState('');
    const [parameters, setParameters] = useState<Parameter[]>([
        { key: 'item_id', type: 'String', desc: '商品 ID', isRequired: true }
    ]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name) newErrors.name = '事件名称不能为空';
        else if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
            newErrors.name = '只能包含小写字母、数字和下划线，必须以字母或下划线开头';
        }
        if (!description) newErrors.description = '描述不能为空';

        parameters.forEach((p, idx) => {
            if (!p.key) newErrors[`param_${idx}_key`] = '键名必填';
            else if (!/^[a-z_][a-z0-9_]*$/.test(p.key)) {
                newErrors[`param_${idx}_key`] = '格式错误';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddParam = () => {
        setParameters([...parameters, { key: '', type: 'String', desc: '', isRequired: false }]);
    };

    const handleRemoveParam = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const handleParamChange = (index: number, field: keyof Parameter, value: any) => {
        const newParams = [...parameters];
        newParams[index] = { ...newParams[index], [field]: value };
        setParameters(newParams);
    };

    const handleSubmit = () => {
        if (validate()) {
            // TODO: API Call
            showToast(`事件 ${name} 创建成功`, 'success');
            closeModal();
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />
                        新增埋点事件
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">创建新埋点并定义其携带的业务参数</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">事件名称 (Event Code)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如: click_purchase_btn"
                            className={cn(
                                "w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2",
                                errors.name ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/20"
                            )}
                        />
                        {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">事件类型</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                        >
                            <option>Click</option>
                            <option>Exposure</option>
                            <option>PageView</option>
                            <option>Custom</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">所属页面</label>
                    <select
                        value={page}
                        onChange={(e) => setPage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    >
                        <option>首页</option>
                        <option>商品详情页</option>
                        <option>购物车</option>
                        <option>支付成功页</option>
                        <option>个人中心</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">业务描述</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="描述该埋点触发的业务场景..."
                        rows={2}
                        className={cn(
                            "w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2",
                            errors.description ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/20"
                        )}
                    />
                </div>

                {/* Parameters Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">参数定义 ({parameters.length})</label>
                        <button
                            onClick={handleAddParam}
                            className="text-[10px] font-bold text-primary flex items-center gap-1 hover:brightness-110"
                        >
                            <Plus className="w-3 h-3" /> 添加参数
                        </button>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-3 py-2 font-bold text-muted-foreground">键名 (Key)</th>
                                    <th className="px-3 py-2 font-bold text-muted-foreground w-24">类型</th>
                                    <th className="px-3 py-2 font-bold text-muted-foreground">说明</th>
                                    <th className="px-3 py-2 font-bold text-muted-foreground w-12 text-center">必填</th>
                                    <th className="px-3 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {parameters.map((p, idx) => (
                                    <tr key={idx} className="group">
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                value={p.key}
                                                onChange={(e) => handleParamChange(idx, 'key', e.target.value)}
                                                className={cn(
                                                    "w-full bg-transparent border-none focus:ring-0 text-xs font-mono",
                                                    errors[`param_${idx}_key`] ? "text-red-400" : ""
                                                )}
                                                placeholder="param_key"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <select
                                                value={p.type}
                                                onChange={(e) => handleParamChange(idx, 'type', e.target.value)}
                                                className="w-full bg-transparent border-none text-[10px] font-bold uppercase focus:ring-0"
                                            >
                                                <option>String</option>
                                                <option>Number</option>
                                                <option>Boolean</option>
                                                <option>Object</option>
                                                <option>Array</option>
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                value={p.desc}
                                                onChange={(e) => handleParamChange(idx, 'desc', e.target.value)}
                                                className="w-full bg-transparent border-none focus:ring-0 text-xs"
                                                placeholder="参数含义..."
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={p.isRequired}
                                                onChange={(e) => handleParamChange(idx, 'isRequired', e.target.checked)}
                                                className="rounded bg-white/10 border-white/20 text-primary focus:ring-0 focus:ring-offset-0"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => handleRemoveParam(idx)}
                                                className="p-1 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end gap-3 shrink-0">
                <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                >
                    取消
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    创建事件
                </button>
            </div>
        </div>
    );
};
