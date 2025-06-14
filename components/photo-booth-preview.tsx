import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PhotoBoothPreviewProps {
  template?: 'classic' | 'triple' | 'grid2x2' | 'grid2x3' | 'single';
  showTitle?: boolean;
}

const dummyPhotos = [
  'https://images.unsplash.com/photo-1616766098946-e4fabb7d6da0?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
];

export default function PhotoBoothPreview({ 
  template = 'classic', 
  showTitle = true 
}: PhotoBoothPreviewProps) {
  const renderTemplate = () => {
    switch (template) {
      case 'classic':
        return (
          <div className="bg-white p-4 shadow-lg rounded-md max-w-sm mx-auto">
            <div className="border-4 border-black p-2 bg-white">
              <div className="flex flex-col gap-2 aspect-[1/3]">
                {dummyPhotos.slice(0, 4).map((photo, index) => (
                  <div key={index} className="flex-1 border-2 border-gray-700">
                    <img
                      src={photo}
                      alt={`Person ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'triple':
        return (
          <div className="bg-white p-4 shadow-lg rounded-md max-w-sm mx-auto">
            <div className="border-4 border-black p-2 bg-white">
              <div className="flex flex-col gap-2 aspect-[1/2.25]">
                {dummyPhotos.slice(0, 3).map((photo, index) => (
                  <div key={index} className="flex-1 border-2 border-gray-700">
                    <img
                      src={photo}
                      alt={`Person ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'grid2x2':
        return (
          <div className="bg-white p-4 shadow-lg rounded-md max-w-sm mx-auto">
            <div className="border-4 border-black p-2 bg-white">
              <div className="grid grid-cols-2 gap-2 aspect-square">
                {dummyPhotos.slice(0, 4).map((photo, index) => (
                  <div key={index} className="border-2 border-gray-700 aspect-square">
                    <img
                      src={photo}
                      alt={`Person ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'grid2x3':
        return (
          <div className="bg-white p-4 shadow-lg rounded-md max-w-sm mx-auto">
            <div className="border-4 border-black p-2 bg-white">
              <div className="grid grid-cols-2 gap-2 aspect-[2/3]">
                {dummyPhotos.slice(0, 6).map((photo, index) => (
                  <div key={index} className="border-2 border-gray-700 aspect-square">
                    <img
                      src={photo}
                      alt={`Person ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'single':
        return (
          <div className="bg-white p-4 shadow-lg rounded-md max-w-sm mx-auto">
            <div className="border-4 border-black p-2 bg-white">
              <div className="border-2 border-gray-700 aspect-[4/6]">
                <img
                  src={dummyPhotos[0]}
                  alt="Single person"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTemplateInfo = () => {
    switch (template) {
      case 'classic':
        return { name: 'Classic Strip', size: '2" × 6"', count: 4 };
      case 'triple':
        return { name: 'Triple Strip', size: '2" × 4.5"', count: 3 };
      case 'grid2x2':
        return { name: 'Grid 4x4', size: '4" × 4"', count: 4 };
      case 'grid2x3':
        return { name: '2x3 Grid', size: '4" × 6"', count: 6 };
      case 'single':
        return { name: 'Single Photo', size: '4" × 6"', count: 1 };
      default:
        return { name: 'Template', size: '', count: 0 };
    }
  };

  const templateInfo = getTemplateInfo();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        {showTitle && (
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {templateInfo.name}
            </h3>
            <div className="flex justify-center gap-2 mt-2">
              <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-200 rounded-md">
                {templateInfo.size}
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-200 rounded-md">
                {templateInfo.count} photos
              </span>
            </div>
          </div>
        )}
        {renderTemplate()}
      </CardContent>
    </Card>
  );
}

// Example usage component for showcasing all templates
export function PhotoBoothShowcase() {
  const templates: Array<{ id: 'classic' | 'triple' | 'grid2x2' | 'grid2x3' | 'single'; title: string }> = [
    { id: 'classic', title: 'Classic 4-Photo Strip' },
    { id: 'triple', title: 'Triple Photo Strip' },
    { id: 'grid2x2', title: '2x2 Grid Layout' },
    { id: 'grid2x3', title: '2x3 Grid Layout' },
    { id: 'single', title: 'Single Photo' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📸 Photo Booth Templates
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional photo booth layouts with real people. Perfect for events, 
            parties, and creating lasting memories with friends and family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {templates.map((template) => (
            <div key={template.id} className="transform hover:scale-105 transition-transform duration-200">
              <PhotoBoothPreview template={template.id} showTitle={true} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              ✨ Features Highlights
            </h3>
            <ul className="text-left text-gray-600 space-y-1">
              <li>• Real-time camera capture</li>
              <li>• Custom stickers and backgrounds</li>
              <li>• Multiple photo layouts</li>
              <li>• Instant download</li>
              <li>• Mobile-responsive design</li>
              <li>• 7 language support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
