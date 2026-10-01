import { memo } from 'react';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import {
  RHFCheckbox,
  RHFCheckboxGroup,
  RHFDateTimeParts,
  RHFRadioGroup,
  RHFSelect,
  RHFTextField,
} from '../../form';
import { useContentForm } from '../../../hooks/useContentForm';
import { useFieldAccess } from '../../../hooks/useFieldAccess';
import {
  AUTO_RECOMMEND_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  END_STATUS_OPTIONS,
  FIXED_CONTENT_TYPE_OPTIONS,
  NOTICE_TYPE_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  SUPPORT_CHAT_OPTIONS,
  VISIBILITY_OPTIONS,
} from '../../../models/options';
import { FormRow } from './FormRow';

const FIELD_WIDTH = 360;

// memo：非表示の間に親（タブ切替など）が再レンダリングされてもスキップ
export const PropertyScreen = memo(function PropertyScreen() {
  const { control } = useContentForm();
  const { isDisabled } = useFieldAccess();

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, columnGap: 6, rowGap: 1 }}>
        {/* 左列 */}
        <Stack spacing={1} sx={{ maxWidth: 120 + 16 + FIELD_WIDTH }}>
          <FormRow label="ID">
            <RHFTextField control={control} name="attributes.id" disabled={isDisabled('attributes.id')} fullWidth />
          </FormRow>
          <FormRow label="公開設定">
            <RHFSelect control={control} name="attributes.visibility" disabled={isDisabled('attributes.visibility')} options={VISIBILITY_OPTIONS} fullWidth />
          </FormRow>
          <FormRow label="公開開始日">
            <RHFDateTimeParts control={control} name="attributes.publishStart" disabled={isDisabled('attributes.publishStart')} />
          </FormRow>
          <FormRow label="公開終了日">
            <RHFDateTimeParts control={control} name="attributes.publishEnd" disabled={isDisabled('attributes.publishEnd')} />
          </FormRow>
          <FormRow label="登録日">
            <RHFDateTimeParts control={control} name="attributes.registeredAt" disabled={isDisabled('attributes.registeredAt')} />
          </FormRow>
          <FormRow label="更新日（未使用）">
            <RHFDateTimeParts control={control} name="attributes.updatedAt" disabled={isDisabled('attributes.updatedAt')} />
          </FormRow>
          <FormRow label="ステータス">
            <RHFSelect control={control} name="attributes.status" disabled={isDisabled('attributes.status')} options={STATUS_OPTIONS} fullWidth />
          </FormRow>
          <FormRow label="自動レコメンド">
            <RHFRadioGroup control={control} name="attributes.autoRecommend" disabled={isDisabled('attributes.autoRecommend')} options={AUTO_RECOMMEND_OPTIONS} />
          </FormRow>
          <FormRow label="終了ステータス">
            <RHFRadioGroup control={control} name="attributes.endStatus" disabled={isDisabled('attributes.endStatus')} options={END_STATUS_OPTIONS} />
          </FormRow>
        </Stack>

        {/* 右列 */}
        <Stack spacing={1} sx={{ maxWidth: 140 + 16 + FIELD_WIDTH }}>
          <FormRow label="作成者" labelWidth={140}>
            <RHFTextField control={control} name="attributes.creator" disabled={isDisabled('attributes.creator')} fullWidth />
          </FormRow>
          <FormRow label="更新者" labelWidth={140}>
            <RHFTextField control={control} name="attributes.updater" disabled={isDisabled('attributes.updater')} fullWidth />
          </FormRow>
          <FormRow label="関連コンテンツ" labelWidth={140}>
            {/* TODO: 関連コンテンツ編集ダイアログ */}
            <Button variant="contained" disabled={isDisabled('action.relatedEdit')} sx={{ width: 100 }}>
              編集
            </Button>
          </FormRow>
          <FormRow label="固定コンテンツ種別" labelWidth={140}>
            <RHFSelect control={control} name="attributes.fixedContentType" disabled={isDisabled('attributes.fixedContentType')} options={FIXED_CONTENT_TYPE_OPTIONS} fullWidth />
          </FormRow>
          <FormRow label="重要度" labelWidth={140}>
            <RHFTextField
              control={control}
              name="attributes.importance"
              disabled={isDisabled('attributes.importance')}
              fullWidth
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            />
          </FormRow>
          <FormRow label="サポチャ連携" labelWidth={140}>
            <RHFRadioGroup control={control} name="attributes.supportChat" disabled={isDisabled('attributes.supportChat')} options={SUPPORT_CHAT_OPTIONS} />
          </FormRow>
          <FormRow label="スキルID" labelWidth={140}>
            <RHFTextField control={control} name="attributes.skillId" disabled={isDisabled('attributes.skillId')} fullWidth />
          </FormRow>
          <FormRow label="更新日そのまま（未使用）" labelWidth={140}>
            <Stack direction="row" alignItems="center" spacing={4}>
              <RHFCheckbox control={control} name="attributes.keepUpdatedAt" disabled={isDisabled('attributes.keepUpdatedAt')} />
              <RHFCheckbox control={control} name="attributes.undeletable" disabled={isDisabled('attributes.undeletable')} label="削除不可" labelPlacement="start" />
            </Stack>
          </FormRow>
          <FormRow label="コンテンツ種別" labelWidth={140}>
            <RHFRadioGroup control={control} name="attributes.contentType" disabled={isDisabled('attributes.contentType')} options={CONTENT_TYPE_OPTIONS} />
          </FormRow>
          <FormRow label="お知らせ区分" labelWidth={140}>
            <Stack direction="row" alignItems="center">
              <RHFRadioGroup control={control} name="attributes.noticeType" disabled={isDisabled('attributes.noticeType')} options={NOTICE_TYPE_OPTIONS} />
              <RHFCheckbox control={control} name="attributes.pickup" disabled={isDisabled('attributes.pickup')} label="Pickup" />
            </Stack>
          </FormRow>
        </Stack>
      </Box>

      {/* 全幅 */}
      <Stack divider={<Divider />} spacing={1} sx={{ mt: 2 }}>
        <FormRow label="お知らせリンク" alignTop>
          <RHFTextField control={control} name="attributes.noticeLink" disabled={isDisabled('attributes.noticeLink')} multiline minRows={2} fullWidth />
        </FormRow>
        <FormRow label="更新履歴" alignTop>
          <RHFTextField control={control} name="attributes.history" disabled={isDisabled('attributes.history')} multiline minRows={2} fullWidth />
          <Typography variant="caption" color="error">
            ※コンテンツ種別が「html」の場合は最大3行まで表示可能。「FAQ」は特段制限なし。
          </Typography>
        </FormRow>
        <FormRow label="主管情報" alignTop>
          <RHFTextField control={control} name="attributes.owner" disabled={isDisabled('attributes.owner')} multiline minRows={2} fullWidth />
        </FormRow>
        <FormRow label="マニュアル" alignTop>
          <RHFTextField control={control} name="attributes.manual" disabled={isDisabled('attributes.manual')} multiline minRows={2} fullWidth />
        </FormRow>
        <FormRow label="画像ファイル" alignTop>
          <RHFTextField control={control} name="attributes.imageFiles" disabled={isDisabled('attributes.imageFiles')} multiline minRows={2} fullWidth />
        </FormRow>
        <FormRow label="リンク（外部）" alignTop>
          <RHFTextField control={control} name="attributes.externalLinks" disabled={isDisabled('attributes.externalLinks')} multiline minRows={2} fullWidth />
        </FormRow>
        <FormRow label="元ネタ管理" alignTop>
          <RHFCheckboxGroup
            control={control}
            name="attributes.sources"
            disabled={isDisabled('attributes.sources')}
            options={SOURCE_OPTIONS}
            sx={{
              flexWrap: 'nowrap',
              maxHeight: 120,
              overflowY: 'auto',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              px: 1,
            }}
          />
        </FormRow>
      </Stack>
    </Paper>
  );
});
