import {useEffect, useMemo, useRef, useState} from 'react';
import {MinioObject, MinioPath} from '@/types/minio';
import {deleteFile, downloadFile, listBuckets, listObjects, uploadFile} from '@/lib/minio-client';
import {BucketSelector} from './bucket-selector';
import {BreadcrumbNavigation} from './breadcrumb-navigation';
import {SearchFiles} from './search-files';
import {ViewToggle} from './view-toggle';
import {FileGridView} from './file-grid-view';
import {FileTableView} from './file-table-view';
import {EmptyState} from './empty-state';
import {Button} from '@/components/ui/button';
import * as LucideReact from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {useTheme} from '@/components/theme-provider';
import {useLanguage} from '@/contexts/language-context';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {Progress} from '@/components/ui/progress';
import keycloak from '@/lib/keycloak.ts';
import {getCurrentBucket, storeCurrentBucket} from "@/lib/bucket-store.ts";

// 添加进度类型定义
interface ProgressInfo {
    fileName: string;
    progress: number;
    type: 'upload' | 'download';
}

export default function MinioExplorer() {
    const {toast} = useToast();
    const {setTheme} = useTheme();
    const {language, setLanguage, t} = useLanguage();
    const [buckets, setBuckets] = useState<{ name: string; }[]>([]);
    const [currentBucket, setCurrentBucket] = useState<string>('');
    const [currentPath, setCurrentPath] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [loading, setLoading] = useState<boolean>(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
    const [files, setFiles] = useState<MinioObject[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // 添加进度状态
    const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);

    // 加载存储桶列表
    useEffect(() => {
        const loadBuckets = async () => {
            try {
                const bucketList = await listBuckets();
                setBuckets(bucketList);
                if (bucketList.length > 0) {
                    const localBucket = getCurrentBucket();
                    if (localBucket !== null && bucketList.some(bucket => bucket.name === localBucket)) {
                        setCurrentBucket(localBucket);
                    } else {
                        setCurrentBucket(bucketList[0].name);
                    }
                }
            } catch (error) {
                console.error('Error loading buckets:', error);
                toast({
                    title: "错误",
                    description: "无法加载存储桶列表。",
                    variant: "destructive",
                });
            }
        };
        loadBuckets();
    }, []);

    // 加载文件列表
    useEffect(() => {
        const loadFiles = async () => {
            if (!currentBucket) return;
            setLoading(true);
            try {
                const fileList = await listObjects(currentBucket, currentPath);
                console.log(fileList)
                setFiles(fileList);
            } catch (error) {
                console.error('Error loading files:', error);
                toast({
                    title: "错误",
                    description: "无法加载文件列表。",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };
        loadFiles();
    }, [currentBucket, currentPath]);

    // 切换侧边栏折叠状态
    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // 根据搜索词过滤文件
    const filteredFiles = useMemo(() => {
        if (!searchTerm) return files;
        return files.filter(file =>
            file.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [files, searchTerm]);

    // 生成面包屑导航路径
    const breadcrumbPaths = useMemo(() => {
        if (!currentPath) return [];

        const paths: MinioPath[] = [];
        const parts = currentPath.split('/').filter(Boolean);

        let cumulativePath = '';
        for (let i = 0; i < parts.length; i++) {
            cumulativePath += parts[i] + '/';
            paths.push({
                name: parts[i],
                path: cumulativePath,
                isRoot: i === 0,
            });
        }

        return paths;
    }, [currentPath]);

    const handleBucketChange = (bucket: string) => {
        setCurrentBucket(bucket);
        storeCurrentBucket(bucket);
        setCurrentPath('');
        setSearchTerm('');
    };

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
        setSearchTerm('');
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const fileList = await listObjects(currentBucket, currentPath);
            setFiles(fileList);
            toast({
                title: "已刷新",
                description: "文件列表已更新。",
            });
        } catch (error) {
            console.error('Error refreshing files:', error);
            toast({
                title: "错误",
                description: "无法刷新文件列表。",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !currentBucket) return;

        setLoading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // 设置上传进度状态
                setProgressInfo({
                    fileName: file.name,
                    progress: 0,
                    type: 'upload'
                });
                await uploadFile(currentBucket, currentPath, file, (progress) => {
                    setProgressInfo(prev => prev ? {
                        ...prev,
                        progress: Math.round(progress)
                    } : null);
                });
            }

            // 刷新文件列表
            const fileList = await listObjects(currentBucket, currentPath);
            setFiles(fileList);

            toast({
                title: "上传成功",
                description: "文件已成功上传。",
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            toast({
                title: "上传失败",
                description: "文件上传失败。",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setProgressInfo(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDownload = async (file: MinioObject) => {
        if (!currentBucket || file.isFolder) return;

        setLoading(true);
        try {
            // 设置下载进度状态
            setProgressInfo({
                fileName: file.name,
                progress: 0,
                type: 'download'
            });

            const blob = await downloadFile(currentBucket, file.key, (progress) => {
                setProgressInfo(prev => prev ? {
                    ...prev,
                    progress: Math.round(progress)
                } : null);
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "下载成功",
                description: "文件已开始下载。",
            });
        } catch (error) {
            console.error('Error downloading file:', error);
            toast({
                title: "下载失败",
                description: "文件下载失败。",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setProgressInfo(null);
        }
    };

    const handleDelete = async (file: MinioObject) => {
        if (!currentBucket) return;

        setLoading(true);
        try {
            console.log('Deleting file:', file);
            await deleteFile(currentBucket, file.key);

            // 刷新文件列表
            const fileList = await listObjects(currentBucket, currentPath);
            setFiles(fileList);

            toast({
                title: "删除成功",
                description: "文件已成功删除。",
            });
        } catch (error) {
            console.error('Error deleting file:', error);
            toast({
                title: "删除失败",
                description: "文件删除失败。",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        keycloak.logout()
    };

    return (
        <div className="h-full w-full flex flex-col">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
            />
            {/* 主标题栏 */}
            <div
                className="w-full h-[60px] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
                <div className="w-full h-full px-6">
                    <div className="flex items-center justify-between w-full h-full">
                        <div className="flex items-center gap-2 min-w-0">
                            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="flex-none mr-2">
                                <LucideReact.Menu size={18}/>
                            </Button>
                            <h1 className="text-xl font-semibold tracking-tight truncate">
                                {t('app.title')}{currentBucket ? ` (${currentBucket})` : ''}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        {language === 'zh' ? '中' : 'EN'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setLanguage('zh')}>
                                        <span>中文</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setLanguage('en')}>
                                        <span>English</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <LucideReact.Sun
                                            className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                                        <LucideReact.Moon
                                            className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                                        <span className="sr-only">Toggle theme</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        <LucideReact.Sun className="mr-2 h-4 w-4"/>
                                        <span>{t('theme.light')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        <LucideReact.Moon className="mr-2 h-4 w-4"/>
                                        <span>{t('theme.dark')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        <LucideReact.Laptop className="mr-2 h-4 w-4"/>
                                        <span>{t('theme.system')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <LucideReact.User size={18}/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LucideReact.LogOut className="mr-2 h-4 w-4"/>
                                        <span>{t('user.logout')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* 进度提示 */}
            {progressInfo && (
                <div className="fixed bottom-4 right-4 w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {progressInfo.type === 'upload' ? '上传中' : '下载中'}: {progressInfo.fileName}
              </span>
                            <span className="text-sm text-muted-foreground">
                {progressInfo.progress}%
              </span>
                        </div>
                        <Progress value={progressInfo.progress} className="w-full"/>
                    </div>
                </div>
            )}

            {/* 内容区域 */}
            <div className="flex-1 flex min-h-0 w-full mt-[60px]">
                {/* 可折叠侧边栏 */}
                <div
                    className={`${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-[250px] opacity-100'} flex-none border-r bg-muted/10 transition-all duration-300 overflow-hidden`}>
                    <div className="p-4 border-b">
                        <BucketSelector
                            buckets={buckets}
                            selectedBucket={currentBucket}
                            onSelectBucket={handleBucketChange}
                        />
                    </div>
                </div>

                {/* 主内容区 */}
                <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
                    {/* 工具栏 */}
                    <div className="flex-none w-full px-6 py-2 border-b bg-muted/40">
                        <div className="flex items-center justify-between gap-4 w-full">
                            <div className="flex-1">
                                <SearchFiles onSearch={setSearchTerm}/>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
                                    <LucideReact.RefreshCw size={16} className={loading ? "animate-spin" : ""}/>
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleUpload}>
                                    <LucideReact.Upload size={16}/>
                                </Button>
                                <ViewToggle viewMode={viewMode} onChange={setViewMode}/>
                            </div>
                        </div>
                    </div>

                    {/* 文件显示区 */}
                    <div className="flex-1 w-full overflow-auto">
                        <div className="h-full w-full px-6 py-3">
                            <div className="w-full">
                                <BreadcrumbNavigation
                                    bucket={currentBucket}
                                    paths={breadcrumbPaths}
                                    onNavigate={handleNavigate}
                                />

                                {filteredFiles.length === 0 ? (
                                    <EmptyState
                                        isFiltered={searchTerm.length > 0}
                                        onClearFilter={() => setSearchTerm('')}
                                    />
                                ) : (
                                    viewMode === 'grid' ? (
                                        <div className="w-full">
                                            <FileGridView
                                                files={filteredFiles}
                                                onNavigate={handleNavigate}
                                                onDownload={handleDownload}
                                                onDelete={handleDelete}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <FileTableView
                                                files={filteredFiles}
                                                onNavigate={handleNavigate}
                                                onDownload={handleDownload}
                                                onDelete={handleDelete}
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}