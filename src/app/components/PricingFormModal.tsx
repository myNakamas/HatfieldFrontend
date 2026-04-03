import { AutoComplete, Col, InputNumber, Modal, Row, Select } from 'antd';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { deviceTypes } from '../models/enums/deviceTypeEnums';
import { Brand } from '../models/interfaces/shop';
import { Pricing } from '../pages/pricing/types';
import { AntFormField } from './form/Field';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Pricing) => void;
  initialValues?: Pricing | null;
  loading: boolean;
  brands: Brand[];
}

export const PricingFormModal = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
  brands,
}: Props) => {
  const methods = useForm<Pricing>({
    defaultValues: {
      id: undefined,
      deviceType: 'Phone',
      brand: '',
      model: '',
      issue: '',
      price: 0,
      originalPrice: null,
    },
  });

  const { handleSubmit, reset } = methods;
    const models = brands?.find((b) => b.value === methods.watch('brand'))?.models ?? []

  // Reset form when modal opens or initialValues change
  useEffect(() => {
    if (open) {
      if (initialValues) {
        reset(initialValues);
      } else {
        reset({
          id: undefined,
          deviceType: deviceTypes['mobile'],
          brand: '',
          model: '',
          issue: '',
          price: 0,
          originalPrice: null,
        });
      }
    }
  }, [open, initialValues, reset]);

  const onFormSubmit = (values: Pricing) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={initialValues ? 'Edit Pricing' : 'Add Pricing'}
      open={open}
      onOk={handleSubmit(onFormSubmit)}
      onCancel={onClose}
      confirmLoading={loading}
      className='prices'
      destroyOnHidden
    >
      <FormProvider {...methods}>
        <form>
          <Controller
            name="id"
            render={({ field }) => <input type="hidden" {...field} />}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Controller
                name="deviceType"
                rules={{ required: 'Device Type is required' }}
                render={({ field, fieldState }) => (
                  <AntFormField label="Device Type" error={fieldState.error}>
                    <Select
                      {...field}
                      options={Object.values(deviceTypes).map((type) => ({ label: type, value: type }))}
                      placeholder="Select device type"
                    />
                  </AntFormField>
                )}
              />
            </Col>
          </Row>

          <Controller
              control={methods.control}
              name={'brand'}
              render={({ field, fieldState }) => (
                  <AntFormField label='Brand' error={fieldState.error}>
                      <AutoComplete
                          options={brands}
                          value={field.value}
                          filterOption
                          onChange={(newValue) => {
                              methods.setValue('model', '')
                              field.onChange(newValue)
                          }}
                          allowClear
                      />
                  </AntFormField>
              )}
          />
          <Controller
              control={methods.control}
              name={'model'}
              render={({ field, fieldState }) => (
                  <AntFormField label='Model' error={fieldState.error}>
                      <AutoComplete
                          options={models}
                          value={field.value}
                          filterOption
                          onChange={(newValue) => field.onChange(newValue)}
                          allowClear
                      />
                  </AntFormField>
              )}
          />
          <Row gutter={16}>
            <Col span={24}>
              <Controller
                name="issue"
                rules={{ required: 'Issue is required' }}
                render={({ field, fieldState }) => (
                  <AntFormField label="Issue" error={fieldState.error} >
                      <SelectIssue deviceType={methods.watch('deviceType')} setIssue={(issue) => field.onChange(issue)} selectedIssue={field.value} />
                  </AntFormField>
                )}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Controller
                name="price"
                rules={{ required: 'Price is required' }}
                render={({ field, fieldState }) => (
                  <AntFormField label="Price" error={fieldState.error}>
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="Current selling price"
                    />
                  </AntFormField>
                )}
              />
            </Col>

            <Col span={12}>
              <Controller
                name="originalPrice"
                render={({ field, fieldState }) => (
                  <AntFormField label="Original Price" error={fieldState.error}>
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="Original price (optional)"
                    />
                  </AntFormField>
                )}
              />
            </Col>
          </Row>
        </form>
      </FormProvider>
    </Modal>
  );
};

const SelectIssue = ({ deviceType, setIssue, selectedIssue }: { setIssue: (issue: string) => void; deviceType: string; selectedIssue: string }) => {
    const issues = {
        smartphone: [
            'Cracked screen',
            'Back cracked',
            'Phone not starting',
            'Battery not working',
            'Not charging',
            'Other issue',
        ],
        laptop: ['Cracked screen', 'Laptop not starting', 'Battery not working', 'Not charging', 'Other issue'],
        tablet: ['Cracked screen', 'Tablet not starting', 'Battery not working', 'Not charging', 'Other issue'],
        pc: ['Operation system issues', 'PC not starting', 'Hark disk space not enough', 'Other issue'],
    }
    const deviceIssues = issues[deviceType.toLowerCase() as keyof typeof issues] || [];
    return (
        <div className='choice-grid'>
            {deviceIssues.map((issue, index) => (
                <div key={'issue' + index} className={`choice-item ${selectedIssue === issue ? 'selected' : ''}`} onClick={() => setIssue(issue)}>
                    <div>{issue}</div>
                </div>
            ))}
        </div>
    )
}