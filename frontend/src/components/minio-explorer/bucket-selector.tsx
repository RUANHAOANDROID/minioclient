import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {MinioBucket} from '@/types/minio';
import {ChevronDown, Database} from 'lucide-react';

interface BucketSelectorProps {
    buckets: MinioBucket[];
    selectedBucket: string;
    onSelectBucket: (bucket: string) => void;
}

export function BucketSelector({
                                   buckets,
                                   selectedBucket,
                                   onSelectBucket,
                               }: BucketSelectorProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Database size={16}/>
                        <span className="truncate">{selectedBucket}</span>
                    </div>
                    <ChevronDown size={16}/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
                {buckets.map((bucket) => (
                    <DropdownMenuItem
                        key={bucket.name}
                        onClick={() => onSelectBucket(bucket.name)}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <Database size={16}/>
                            <span>{bucket.name}</span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}