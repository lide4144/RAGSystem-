import React, { useState } from 'react';
import { User, Cpu, Database, Key, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';

type SettingsTab = 'account' | 'model' | 'rag' | 'api';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const toggleKey = (id: string) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'account', label: '个人账户', icon: User },
    { id: 'model', label: '模型配置', icon: Cpu },
    { id: 'rag', label: 'RAG 引擎', icon: Database },
    { id: 'api', label: 'API 密钥', icon: Key },
  ];

  return (
    <div className="p-8 h-full animate-fade-in flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">系统设置</h1>
        <p className="text-slate-400">管理个人资料、模型参数及系统连接配置。</p>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Left Sidebar Navigation */}
        <div className="w-64 flex flex-col gap-2 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-transparent border-l-2 border-cyan-400 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-cyan-400' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden flex flex-col relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'model' && <ModelSettings />}
            {activeTab === 'rag' && <RagSettings />}
            {activeTab === 'api' && <ApiSettings showKey={showKey} toggleKey={toggleKey} />}
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur flex justify-end gap-4 z-10">
            <button className="px-6 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">
              重置默认
            </button>
            <button className="px-6 py-2 rounded-xl text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all active:scale-95">
              <Save className="w-4 h-4" />
              保存更改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const SectionTitle: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-300">{label}</label>
    {children}
  </div>
);

const AccountSettings = () => (
  <div className="max-w-2xl space-y-8 animate-fade-in">
    <SectionTitle title="个人资料" desc="更新您的个人信息和登录凭证。" />
    
    <div className="flex items-center gap-6 mb-8">
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-slate-800">
        JD
      </div>
      <div>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10">
          更换头像
        </button>
        <p className="text-xs text-slate-500 mt-2">支持 JPG, PNG 格式，最大 2MB</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <InputGroup label="显示名称">
        <input type="text" defaultValue="John Doe" className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all" />
      </InputGroup>
      <InputGroup label="电子邮箱">
        <input type="email" defaultValue="john.doe@research.lab" disabled className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-slate-400 cursor-not-allowed" />
      </InputGroup>
    </div>

    <div className="pt-6 border-t border-white/5">
       <h3 className="text-lg font-medium text-white mb-4">修改密码</h3>
       <div className="grid grid-cols-2 gap-6">
        <InputGroup label="当前密码">
          <input type="password" placeholder="••••••••" className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
        </InputGroup>
        <InputGroup label="新密码">
          <input type="password" placeholder="••••••••" className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
        </InputGroup>
       </div>
    </div>
  </div>
);

const ModelSettings = () => {
  const [temp, setTemp] = useState(0.7);
  
  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <SectionTitle title="模型参数配置" desc="自定义 LLM 的行为模式和生成参数。" />

      <div className="space-y-6">
        <InputGroup label="首选模型">
          <select className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 appearance-none">
            <option>GPT-4 Turbo (OpenAI)</option>
            <option>Claude 3 Opus (Anthropic)</option>
            <option>Llama 3 70B (Local/Groq)</option>
            <option>Gemini Pro 1.5 (Google)</option>
          </select>
        </InputGroup>

        <div className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center">
             <label className="text-sm font-medium text-slate-200">温度 (Temperature)</label>
             <span className="text-cyan-400 font-mono text-sm">{temp}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={temp} 
            onChange={(e) => setTemp(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
          />
          <p className="text-xs text-slate-500">
            较低的值使输出更集中和确定，较高的值使输出更随机和具有创造性。推荐值：0.7 用于一般问答。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
           <InputGroup label="最大输出 Token (Max Tokens)">
             <input type="number" defaultValue={2048} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
           </InputGroup>
           <InputGroup label="上下文窗口 (Context Window)">
             <input type="text" defaultValue="128k (Auto)" disabled className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-slate-400 cursor-not-allowed" />
           </InputGroup>
        </div>
      </div>
    </div>
  );
};

const RagSettings = () => {
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap] = useState(50);
  const [topK, setTopK] = useState(5);

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <SectionTitle title="RAG 引擎设置" desc="调整文档切片策略和检索召回参数。" />

      <div className="space-y-8">
        {/* Indexing Strategy */}
        <div className="space-y-6">
          <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-white/5 pb-2">索引策略</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-200">切片大小 (Chunk Size)</label>
              <span className="text-cyan-400 font-mono text-sm">{chunkSize} chars</span>
            </div>
            <input 
              type="range" min="128" max="2048" step="64" value={chunkSize} onChange={(e) => setChunkSize(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-200">重叠大小 (Chunk Overlap)</label>
              <span className="text-cyan-400 font-mono text-sm">{overlap} chars</span>
            </div>
            <input 
              type="range" min="0" max="200" step="10" value={overlap} onChange={(e) => setOverlap(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
            />
          </div>
        </div>

        {/* Retrieval Strategy */}
        <div className="space-y-6 pt-6">
           <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-white/5 pb-2">检索策略</h3>
           
           <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
             <div>
               <div className="text-sm font-medium text-white">混合检索 (Hybrid Search)</div>
               <div className="text-xs text-slate-500">结合关键词搜索与向量语义检索以提高准确性</div>
             </div>
             <div className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" defaultChecked className="sr-only peer" />
               <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
             </div>
           </div>

           <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-200">召回数量 (Top K)</label>
              <span className="text-cyan-400 font-mono text-sm">{topK} docs</span>
            </div>
            <input 
              type="range" min="1" max="20" step="1" value={topK} onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ApiSettings: React.FC<{ showKey: Record<string, boolean>; toggleKey: (id: string) => void }> = ({ showKey, toggleKey }) => {
  const ApiRow = ({ id, label, placeholder }: { id: string; label: string; placeholder: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <input 
          type={showKey[id] ? "text" : "password"} 
          placeholder={placeholder}
          className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-cyan-500/50 font-mono text-sm transition-all"
        />
        <button 
          onClick={() => toggleKey(id)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        >
          {showKey[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <SectionTitle title="API 密钥管理" desc="安全存储您的 LLM 提供商 API 密钥。" />

      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3 mb-6">
         <div className="p-1 bg-yellow-500/20 rounded-full mt-0.5">
           <Key className="w-3 h-3 text-yellow-400" />
         </div>
         <div>
           <h4 className="text-sm font-medium text-yellow-200">安全提示</h4>
           <p className="text-xs text-yellow-200/70 mt-1">
             您的 API 密钥已在本地加密存储。系统不会将密钥发送到除了 LLM 提供商之外的任何第三方服务器。
           </p>
         </div>
      </div>

      <div className="space-y-6">
        <ApiRow id="openai" label="OpenAI API Key" placeholder="sk-..." />
        <ApiRow id="anthropic" label="Anthropic API Key" placeholder="sk-ant-..." />
        <ApiRow id="chroma" label="ChromaDB Connection String (Optional)" placeholder="http://localhost:8000" />
      </div>

      <div className="flex items-center justify-between pt-4">
        <button className="text-xs text-slate-500 hover:text-cyan-400 underline decoration-slate-700 underline-offset-4 transition-colors">
          如何获取 API 密钥？
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          验证连接
        </button>
      </div>
    </div>
  );
};

export default Settings;