import React, { useState, useEffect } from 'react';
import { X, Database, Copy, Check, FileText, Server } from 'lucide-react';
import { SchemaDocs } from '../types.ts';
import { api } from '../api.ts';

interface SchemaDocsModalProps {
  onClose: () => void;
}

export const SchemaDocsModal: React.FC<SchemaDocsModalProps> = ({ onClose }) => {
  const [docs, setDocs] = useState<SchemaDocs | null>(null);
  const [activeTab, setActiveTab] = useState<'sqlite' | 'mongo' | 'deploy'>('sqlite');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.getSchemaDocs()
      .then(setDocs)
      .catch(console.error);
  }, []);

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!docs) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">{docs.title}</h2>
              <p className="text-xs text-stone-500">專為公司行管理員提供的資料庫設計與部屬規格</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 px-6 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('sqlite')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'sqlite'
                ? 'bg-white text-stone-900 border-t-2 border-stone-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            SQLite DDL 結構
          </button>
          <button
            onClick={() => setActiveTab('mongo')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'mongo'
                ? 'bg-white text-stone-900 border-t-2 border-stone-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-green-600" />
            MongoDB Mongoose 模型
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'deploy'
                ? 'bg-white text-stone-900 border-t-2 border-stone-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            啟動與部屬手冊
          </button>
        </div>

        {/* Content View */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'sqlite' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">
                  可直接匯入 SQLite 檔案執行建表
                </span>
                <button
                  onClick={() => copyCode(docs.sqliteDDL, 'sqlite')}
                  className="px-3 py-1 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1 transition"
                >
                  {copied === 'sqlite' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === 'sqlite' ? '已複製 DDL' : '複製 DDL'}
                </button>
              </div>
              <pre className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed max-h-96">
                {docs.sqliteDDL}
              </pre>
            </div>
          )}

          {activeTab === 'mongo' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">
                  相容於 MongoDB Atlas / Mongoose ORM
                </span>
                <button
                  onClick={() => copyCode(docs.mongoSchema, 'mongo')}
                  className="px-3 py-1 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1 transition"
                >
                  {copied === 'mongo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === 'mongo' ? '已複製 Schema' : '複製 Schema'}
                </button>
              </div>
              <pre className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed max-h-96">
                {docs.mongoSchema}
              </pre>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">
                  本地開發與伺服器生產環境部屬完整指令說明
                </span>
                <button
                  onClick={() => copyCode(docs.deploymentGuide, 'deploy')}
                  className="px-3 py-1 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1 transition"
                >
                  {copied === 'deploy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === 'deploy' ? '已複製指南' : '複製部屬手冊'}
                </button>
              </div>
              <pre className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed max-h-96">
                {docs.deploymentGuide}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
