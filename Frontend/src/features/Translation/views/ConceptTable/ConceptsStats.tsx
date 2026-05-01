import { Card } from '@/components/ui/card';
import ConceptsStatusChart from './ConceptsStatusChart';

interface Props {
  total: number;
  translated: number;
  validated: number;
}

export default function ConceptsStats({ total, translated, validated }: Props) {
  const translatedPercent = ((translated * 100) / Math.max(total, 1)).toFixed(2);
  const validatedPercent = ((validated * 100) / Math.max(total, 1)).toFixed(2);

  return (
    <Card className='p-6'>
      <div className='flex flex-row items-center lg:items-stretch gap-10'>
        {/* LEFT — NUMBERS */}
        <div className='flex flex-1 flex-col gap-8'>
          <div>
            <span className='text-muted-foreground text-sm'>Concepte</span>

            <div className='mt-4 flex gap-12'>
              <div className='flex flex-col'>
                <span className='text-muted-foreground text-xs'>Total</span>
                <span className='text-2xl font-bold'>{total}</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-orangeCnas text-xs'>Traduse</span>
                <span className='text-2xl font-bold text-orangeCnas'>{translated}</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-blueCnas text-xs'>Validate</span>
                <span className='text-2xl font-bold text-blueCnas'>{validated}</span>
              </div>
            </div>
          </div>

          <div className='flex gap-10 pt-4 border-t'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground text-xs'>Traduse %</span>
              <span className='font-semibold text-orangeCnas'>{translatedPercent}%</span>
            </div>

            <div className='flex flex-col'>
              <span className='text-muted-foreground text-xs'>Validate %</span>
              <span className='font-semibold text-blueCnas'>{validatedPercent}%</span>
            </div>
          </div>
        </div>

        {/* RIGHT — CHART */}
        <div className='flex-shrink-0 w-full max-w-[280px]'>
          <ConceptsStatusChart total={total} translated={translated} validated={validated} />
        </div>
      </div>
    </Card>
  );
}
