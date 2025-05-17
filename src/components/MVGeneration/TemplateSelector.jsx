import React from 'react';

/**
 * 预设模板选择组件
 */
const TemplateSelector = ({ 
  selectedTemplate, 
  setSelectedTemplate,
  applyTemplate
}) => {
  // 模板数据
  const templates = [
    {
      id: 'template1',
      name: '裙角飞扬（竖版）',
      previewImage: '/m1.png',
      description: '竖版9:16，歌词左侧显示'
    },
    {
      id: 'template2',
      name: '彩色气球（横版）',
      previewImage: '/m2.png',
      description: '横版16:9，歌词底部显示'
    },
    {
      id: 'template3',
      name: '黑胶唱片（竖版）',
      previewImage: '/m3.png',
      description: '竖版9:16，带旋转唱片效果'
    }
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>3. 选择预设模板</h3>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {templates.map(template => (
          <div 
            key={template.id}
            onClick={() => {
              setSelectedTemplate(template.id);
              applyTemplate(template.id);
            }}
            style={{
              width: 'calc(33.33% - 10px)',
              border: `2px solid ${selectedTemplate === template.id ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              backgroundColor: selectedTemplate === template.id ? 'rgba(107, 102, 255, 0.05)' : 'white',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ 
              width: '100%', 
              height: '180px',
              position: 'relative',
              backgroundColor: '#f7fafc',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src={template.previewImage} 
                alt={template.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ 
                fontWeight: selectedTemplate === template.id ? 'bold' : 'normal', 
                fontSize: '0.95rem',
                marginBottom: '4px',
                color: selectedTemplate === template.id ? '#6B66FF' : '#2D3748'
              }}>
                {template.name}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#718096',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {template.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
