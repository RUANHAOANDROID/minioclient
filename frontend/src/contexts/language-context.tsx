import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

type TranslationKey = 
  | 'app.title'
  | 'theme.light'
  | 'theme.dark'
  | 'theme.system'
  | 'user.logout'
  | 'file.name'
  | 'file.size'
  | 'file.type'
  | 'file.lastModified'
  | 'file.open'
  | 'file.download'
  | 'file.delete'
  | 'file.upload'
  | 'file.refresh'
  | 'file.search'
  | 'file.empty'
  | 'file.clearFilter'
  | 'file.openMenu'
  | 'file.folder'
  | 'file.folders'
  | 'file.files'
  | 'file.dateFormat'
  | 'file.timeFormat';

type Translations = {
  [key in Language]: {
    [key in TranslationKey]: string;
  };
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Translations = {
  en: {
    'app.title': 'AhaoDrop',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'user.logout': 'Logout',
    'file.name': 'Name',
    'file.size': 'Size',
    'file.type': 'Type',
    'file.lastModified': 'Last Modified',
    'file.open': 'Open',
    'file.download': 'Download',
    'file.delete': 'Delete',
    'file.upload': 'Upload',
    'file.refresh': 'Refresh',
    'file.search': 'Search files and folders...',
    'file.empty': 'No files found',
    'file.clearFilter': 'Clear filter',
    'file.openMenu': 'Open menu',
    'file.folder': 'Folder',
    'file.folders': 'Folders',
    'file.files': 'Files',
    'file.dateFormat': 'MMM d, yyyy',
    'file.timeFormat': 'h:mm a',
  },
  zh: {
    'app.title': 'AhaoDrop',
    'theme.light': '浅色',
    'theme.dark': '深色',
    'theme.system': '跟随系统',
    'user.logout': '退出登录',
    'file.name': '名称',
    'file.size': '大小',
    'file.type': '类型',
    'file.lastModified': '修改时间',
    'file.open': '打开',
    'file.download': '下载',
    'file.delete': '删除',
    'file.upload': '上传',
    'file.refresh': '刷新',
    'file.search': '搜索文件和文件夹...',
    'file.empty': '未找到文件',
    'file.clearFilter': '清除筛选',
    'file.openMenu': '打开菜单',
    'file.folder': '文件夹',
    'file.folders': '文件夹',
    'file.files': '文件',
    'file.dateFormat': 'yyyy年MM月dd日',
    'file.timeFormat': 'HH:mm',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: TranslationKey) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 