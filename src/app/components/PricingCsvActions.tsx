import { Button, Space, Upload, message } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { pricingApi } from '../axios/http/pricingRequests';

interface Props {
  onUploadSuccess: () => void;
}

export const PricingCsvActions = ({ onUploadSuccess }: Props) => {
  const handleDownload = async () => {
    try {
      const response = await pricingApi.downloadCsv();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pricings.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('CSV downloaded successfully');
    } catch (error) {
      message.error('Failed to download CSV');
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.csv',
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        await pricingApi.uploadCsv(file as File);
        message.success('Pricings imported successfully');
        onSuccess?.(null);
        onUploadSuccess();
      } catch (error) {
        message.error('Failed to import CSV');
        onError?.(error as Error);
      }
    },
  };

  return (
    <Space>
      <Button icon={<DownloadOutlined />} onClick={handleDownload}>
        Download CSV Template
      </Button>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Upload CSV</Button>
      </Upload>
    </Space>
  );
};