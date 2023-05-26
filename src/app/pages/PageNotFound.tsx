import NoFound from 'antd/es/result/noFound'
import React from 'react'
import { Button, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

export const PageNotFound = () => {
    const navigate = useNavigate()
    return (
        <Space direction={'vertical'} className={'mainScreen'}>
            <NoFound />
            <Typography>
                <h4>Sorry, the page you tried to visit does not exist.</h4>
            </Typography>
            <Button type={'primary'} onClick={() => navigate('/home')}>
                Back to main page
            </Button>
        </Space>
    )
}
