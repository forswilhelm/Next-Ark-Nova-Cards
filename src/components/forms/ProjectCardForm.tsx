import { zodResolver } from '@hookform/resolvers/zod';
import { Terminal } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Control, useFieldArray, useForm } from 'react-hook-form';

import TagButton from '@/components/buttons/TagButton';
import TagDiv from '@/components/icons/TagDiv';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { BonusType } from '@/types/Bonus';
import { CardSource } from '@/types/CardSource';
import { EffectType } from '@/types/Effect';
import {
  ProjectCardSchema,
  ProjectCardSchemaDto,
  ProjectCategory,
} from '@/types/ProjectCard';
import { allCardTags } from '@/types/Tags';

type ProjectCardFormProps = {
  defaultValues?: ProjectCardSchemaDto;
  isResetting?: boolean;
  onValuesChange: (values: ProjectCardSchemaDto) => void;
};

const emptySlots = (): ProjectCardSchemaDto['slots'] => [
  { position: 1, bonuses: [], indicator: undefined },
  { position: 2, bonuses: [], indicator: undefined },
  { position: 3, bonuses: [], indicator: undefined },
];

export const initialDiyProjectCard: ProjectCardSchemaDto = {
  id: 'FAN',
  name: '',
  type: ProjectCategory.FAN_MADE,
  tag: allCardTags[0],
  slots: emptySlots(),
  placeBonuses: [],
  description: {
    effectType: EffectType.CONSERVATION,
    effectDesc: '',
  },
  source: CardSource.FAN_MADE,
};

// A project card always has exactly 3 reward slots (game rule), so this is
// three fixed, hand-wired sections rather than a dynamic list.
const SlotFields = ({
  control,
  slotIndex,
  label,
}: {
  control: Control<ProjectCardSchemaDto>;
  slotIndex: number;
  label: string;
}) => {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `slots.${slotIndex}.bonuses` as const,
  });

  return (
    <div className='space-y-2 rounded-lg border p-3'>
      <FormField
        control={control}
        name={`slots.${slotIndex}.indicator`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('diy.slot_indicator')}
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === ''
                      ? undefined
                      : parseInt(e.target.value) || 0,
                  )
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {fields.map((field, index) => (
        <div key={field.id} className='flex flex-row items-end gap-2'>
          <FormField
            control={control}
            name={`slots.${slotIndex}.bonuses.${index}.bonusType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                  {t('diy.bonus_type')}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='w-40'>
                      <SelectValue placeholder='Select' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position='popper'>
                    {Object.values(BonusType).map((bonusType) => (
                      <SelectItem key={bonusType} value={bonusType}>
                        {bonusType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`slots.${slotIndex}.bonuses.${index}.bonusValue`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                  {t('diy.bonus_value')}
                </FormLabel>
                <FormControl>
                  <Input
                    className='w-20'
                    value={field.value ?? 0}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            type='button'
            className='border--1 h-10 w-10 rounded-lg border border-input p-2'
            onClick={() => remove(index)}
          >
            X
          </button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() =>
          append({ bonusType: BonusType.CONSERVATION_POINT, bonusValue: 1 })
        }
      >
        {t('diy.add_bonus')}
      </Button>
    </div>
  );
};

export const ProjectCardForm = ({
  defaultValues,
  isResetting,
  onValuesChange,
}: ProjectCardFormProps) => {
  const { t } = useTranslation();
  const form = useForm<ProjectCardSchemaDto>({
    resolver: zodResolver(ProjectCardSchema),
    defaultValues: defaultValues || initialDiyProjectCard,
  });

  const values = form.watch();

  React.useEffect(() => {
    if (isResetting && defaultValues) {
      form.reset(defaultValues);
    }
  }, [isResetting, defaultValues, form]);

  React.useEffect(() => {
    onValuesChange(values);
  }, [values, onValuesChange]);

  const exportToJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(values));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'project.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(exportToJson)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('diy.project_name')}</FormLabel>
              <FormControl>
                <Input placeholder='name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('diy.project_category')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position='popper'>
                  {Object.values(ProjectCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='tag'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('diy.project_tag')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id='project-tag' className='w-48'>
                    {field.value && (
                      <div className='-mx-6 -my-3 scale-[0.5]'>
                        <TagDiv tag={field.value} selected={false} />
                      </div>
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent position='popper'>
                  <div className='grid grid-cols-3 gap-2'>
                    {allCardTags.map((tag) => (
                      <div key={tag} className='-m-3 scale-[0.7]'>
                        <TagButton
                          tag={tag}
                          selected={field.value === tag}
                          onTagClick={(clickedTag) =>
                            field.onChange(clickedTag)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description.effectDesc'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Description')}</FormLabel>
              <FormControl>
                <Textarea placeholder='description' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SlotFields
          control={form.control}
          slotIndex={0}
          label={`${t('diy.slot')} 1`}
        />
        <SlotFields
          control={form.control}
          slotIndex={1}
          label={`${t('diy.slot')} 2`}
        />
        <SlotFields
          control={form.control}
          slotIndex={2}
          label={`${t('diy.slot')} 3`}
        />

        <FormField
          control={form.control}
          name='image'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Image')}</FormLabel>
              <FormControl>
                <Input
                  id='project-picture'
                  type='file'
                  value=''
                  onChange={(e) => {
                    if (e.target.files)
                      return field.onChange(
                        URL.createObjectURL(e.target.files[0]),
                      );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='directUseImage'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <FormLabel className='text-base'>
                {t('diy.use_image_directly')}
              </FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Alert>
          <Terminal className='h-4 w-4' />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>This function is still in beta.</AlertDescription>
        </Alert>
        <Button variant='outline' type='submit'>
          {t('diy.export_json')}
        </Button>
      </form>
    </Form>
  );
};
