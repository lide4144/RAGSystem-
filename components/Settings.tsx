import React, { useState, useEffect } from 'react';
import { User, Cpu, Database, Key, Save, RefreshCw, Eye, EyeOff, Server, CheckCircle2, AlertCircle, Zap, Box, ShieldCheck, Globe, Link } from 'lucide-react';

type SettingsTab = 'account' | 'llm' | 'rag';

interface ModelOption {
  id: string;
  name: string;
  contextWindow: string;
}

interface ProviderConfig {
  id: string;
  name: string;
  icon: string;
  defaultBaseUrl: string;
  defaultModels: ModelOption[]; // Fallback or preset models
}

// Configuration Presets
const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'Zap',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModels: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: '128k' },
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: '128k' },
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: 'Box',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    defaultModels: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', contextWindow: '200k' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', contextWindow: '200k' },
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: 'Server',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModels: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: '1M' },
    ]
  },
  {
    id: 'local',
    name: 'Local / Ollama',
    icon: 'Database',
    defaultBaseUrl: 'http://localhost:11434/v1',
    defaultModels: [
      { id: 'llama3', name: 'Llama 3 (Local)', contextWindow: '8k' },
    ]
  },
  {
    id: 'custom',
    name: 'Custom / Compatible',
    icon: 'Globe',
    defaultBaseUrl: '',
    defaultModels: []
  }
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('llm');

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'llm', label: '模型与接口', icon: Cpu },
    { id: 'rag', label: 'RAG 引擎', icon: Database },
    { id: 'account', label: '个人账户', icon: User },
  ];

  return (
    <div className="p-8 h-full animate-fade-in flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">系统设置</h1>
        <p className="text-slate-400">管理模型连接、RAG 参数及个人偏好。</p>
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
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'llm' && <LLMSettings />}
            {activeTab === 'rag' && <RagSettings />}
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

const InputGroup: React.FC<{ label: string; children: React.ReactNode; subLabel?: string }> = ({ label, children, subLabel }) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {subLabel && <span className="text-xs text-slate-500">{subLabel}</span>}
    </div>
    {children}
  </div>
);

const LLMSettings = () => {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  
  // Params
  const [temp, setTemp] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  // Initialize Base URL when provider changes
  useEffect(() => {
    const provider = PROVIDERS.find(p => p.id === selectedProvider);
    if (provider) {
      setBaseUrl(provider.defaultBaseUrl);
      setApiKey(''); // Clear key for security when switching providers
      setConnectionStatus('idle');
      setAvailableModels([]);
      setSelectedModel('');
    }
  }, [selectedProvider]);

  // Simulate Backend API Verification & Model Fetching
  const verifyAndFetchModels = () => {
    if (!baseUrl) {
      setConnectionStatus('error');
      return;
    }

    setConnectionStatus('loading');
    
    // Simulate Network Request latency
    setTimeout(() => {
      // MOCK LOGIC: In a real app, this would be a fetch to the backend
      // which proxies the request to `${baseUrl}/models`
      
      let fetchedModels: ModelOption[] = [];
      const provider = PROVIDERS.find(p => p.id === selectedProvider);
      
      if (selectedProvider === 'custom') {
        // Mocking a response for a custom provider (e.g., DeepSeek, Moonshot)
        fetchedModels = [
          { id: 'custom-model-v1', name: 'Custom Model V1 (7B)', contextWindow: '32k' },
          { id: 'custom-model-chat', name: 'Custom Chat Alpha', contextWindow: '16k' },
          { id: 'deepseek-coder', name: 'DeepSeek Coder', contextWindow: '128k' },
        ];
      } else if (provider) {
        fetchedModels = provider.defaultModels;
      }

      if (Math.random() > 0.1) { // 90% success rate simulation
        setAvailableModels(fetchedModels);
        if (fetchedModels.length > 0) {
          setSelectedModel(fetchedModels[0].id);
        }
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    }, 1200);
  };

  return (
    <div className="max-w-3xl space-y-10 animate-fade-in">
      {/* 1. Provider Selection */}
      <div>
        <SectionTitle title="LLM 来源配置" desc="选择预设提供商或配置自定义兼容接口。" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {PROVIDERS.map((provider) => {
             const Icon = (provider.icon === 'Zap' ? Zap : provider.icon === 'Box' ? Box : provider.icon === 'Server' ? Server : provider.icon === 'Globe' ? Globe : Database);
             const isSelected = selectedProvider === provider.id;
             
             return (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`relative p-3 rounded-xl border flex flex-col items-center gap-2 transition-all duration-200
                  ${isSelected 
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-800/50 border-white/5 hover:bg-slate-800 hover:border-white/10'
                  }`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium text-center ${isSelected ? 'text-white' : 'text-slate-400'}`}>{provider.name}</span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                )}
              </button>
             );
          })}
        </div>
      </div>

      {/* 2. Connection Details */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-6 relative overflow-hidden">
         {/* Background decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

         <div className="flex items-center justify-between relative z-10">
           <h3 className="text-lg font-medium text-white flex items-center gap-2">
             <Link className="w-5 h-5 text-slate-400" />
             接口连接参数
           </h3>
           <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border transition-all duration-300
             ${connectionStatus === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 
               connectionStatus === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 
               'bg-slate-800/50 border-white/10 text-slate-400'}`}>
             {connectionStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
             {connectionStatus === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
             {connectionStatus === 'loading' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
             {connectionStatus === 'idle' && <div className="w-2 h-2 rounded-full bg-slate-500" />}
             <span>
               {connectionStatus === 'idle' ? '未连接' : 
                connectionStatus === 'loading' ? '正在获取模型列表...' : 
                connectionStatus === 'success' ? '已连接' : '连接失败'}
             </span>
           </div>
         </div>

         <div className="space-y-4 relative z-10">
            {/* Base URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex justify-between">
                <span>API Base URL</span>
                <span className="text-xs text-slate-500">后端将通过此地址获取模型</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Globe className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="e.g. https://api.openai.com/v1"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 font-mono text-sm transition-all"
                />
              </div>
            </div>

            {/* API Key Input */}
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-300">API Key</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Key className="w-4 h-4" />
                  </div>
                  <input 
                    type={showKey ? "text" : "password"} 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={selectedProvider === 'local' ? "本地模式通常无需 Key" : "sk-..."}
                    className={`w-full bg-slate-900/50 border rounded-xl pl-10 pr-12 py-3 text-white focus:outline-none font-mono text-sm transition-all
                      ${connectionStatus === 'error' ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'}
                    `}
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button 
                onClick={verifyAndFetchModels}
                disabled={connectionStatus === 'loading' || !baseUrl}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-medium text-sm border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center shadow-lg active:scale-95"
              >
                {connectionStatus === 'loading' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    获取模型列表
                  </>
                )}
              </button>
            </div>
         </div>
      </div>

      {/* 3. Model Configuration (Conditional) */}
      {availableModels.length > 0 && (
        <div className="space-y-8 animate-fade-in-up">
          <SectionTitle title="模型参数配置" desc="从获取到的列表中选择模型并调整参数。" />
          
          <InputGroup label="选择模型 (Model)">
            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 appearance-none"
              >
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} (Context: {model.contextWindow})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Box className="w-4 h-4" />
              </div>
            </div>
          </InputGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center">
                 <label className="text-sm font-medium text-slate-200">温度 (Temperature)</label>
                 <span className="text-cyan-400 font-mono text-sm">{temp}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={temp} 
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
              />
              <p className="text-xs text-slate-500 leading-relaxed">
                控制输出的随机性。0 为最确定，2 为最具创造性。
              </p>
            </div>

            <div className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/5">
               <div className="flex justify-between items-center">
                 <label className="text-sm font-medium text-slate-200">最大 Token (Max Tokens)</label>
                 <span className="text-cyan-400 font-mono text-sm">{maxTokens}</span>
              </div>
               <input 
                type="range" 
                min="256" 
                max="8192" 
                step="256" 
                value={maxTokens} 
                onChange={(e) => setMaxTokens(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
              />
              <p className="text-xs text-slate-500 leading-relaxed">
                限制单次响应生成的最大长度。设置过低可能导致回答被截断。
              </p>
            </div>
          </div>
        </div>
      )}
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

export default Settings;