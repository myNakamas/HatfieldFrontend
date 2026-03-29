import { useState } from 'react';
import { Button, Space, Typography, Select, Row, Col } from 'antd';
import { PricingFormModal } from '../../components/PricingFormModal';
import { PricingTable } from '../../components/PricingTable';
import { usePricings } from './hooks/usePricings';   // keep your existing hook for mutations
import { Pricing } from './types';
import { PricingCsvActions } from '../../components/PricingCsvActions';
import { useQuery } from 'react-query';
import { pricingApi } from '../../axios/http/pricingRequests';  // import directly
import { getAllBrands } from '../../axios/http/shopRequests';

export default function AdminPricingsPage() {
  const { createPricing, updatePricing, deletePricing, isCreating, isUpdating, isDeleting } = usePricings();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Pricing | null>(null);

  // === Simple Filter States ===
  const [deviceType, setDeviceType] = useState<string | undefined>(undefined);
  const [brand, setBrand] = useState<string | undefined>(undefined);
  const [model, setModel] = useState<string | undefined>(undefined);

  // === Filtered Query (this is what you asked for) ===
  const { data: pricings = [], isLoading } = useQuery({
    queryKey: ['pricings', deviceType, brand, model],           // changes → auto refetch
    queryFn: () => pricingApi.getFiltered(deviceType, brand, model),
    staleTime: 5 * 60 * 1000,
  });

  const { data: brandsForForm } = useQuery('brands', getAllBrands);

  // Unique options for Selects (derived from current data)
  const deviceTypes = [...new Set(pricings.map(p => p.deviceType))].sort();
  const brandsList = [...new Set(pricings.map(p => p.brand))].sort();
  const modelsList = [...new Set(pricings.map(p => p.model))].sort();

  const handleAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: Pricing) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (values.id) {
      updatePricing(values as Pricing);
    } else {
      createPricing(values);
    }
    setModalOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = (id: number) => deletePricing(id);

  const resetFilters = () => {
    setDeviceType(undefined);
    setBrand(undefined);
    setModel(undefined);
  };

  return (
    <div style={{ padding: 24 }} className='w-100'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={2}>Pricing Management</Typography.Title>

        <Space>
          <Button type="primary" onClick={handleAdd}>
            Add New Pricing
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Select
            placeholder="Device Type"
            style={{ width: '100%' }}
            value={deviceType}
            onChange={setDeviceType}
            allowClear
            options={deviceTypes.map(dt => ({ label: dt, value: dt }))}
          />
        </Col>

        <Col xs={24} sm={8}>
          <Select
            placeholder="Brand"
            style={{ width: '100%' }}
            value={brand}
            onChange={setBrand}
            allowClear
            options={brandsList.map(b => ({ label: b, value: b }))}
          />
        </Col>

        <Col xs={24} sm={8}>
          <Select
            placeholder="Model"
            style={{ width: '100%' }}
            value={model}
            onChange={setModel}
            allowClear
            options={modelsList.map(m => ({ label: m, value: m }))}
          />
        </Col>

        <Col>
          <Button onClick={resetFilters} disabled={!deviceType && !brand && !model}>
            Reset Filters
          </Button>
        </Col>
      </Row>

      <PricingTable 
        data={pricings} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        loading={isLoading} 
      />

      <PricingFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingRecord}
        loading={isCreating || isUpdating}
        brands={brandsForForm ?? []}
      />

      <PricingCsvActions onUploadSuccess={() => {}} />

      <div style={{ marginTop: 16 }}>
        CSV Format: deviceType, brand, model, issue, price, originalPrice
      </div>
    </div>
  );
}