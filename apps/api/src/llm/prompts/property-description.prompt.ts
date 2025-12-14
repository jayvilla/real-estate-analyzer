import { Property } from '@real-estate-analyzer/types';

export function buildPropertyDescriptionPrompt(property: Property): string {
  return `You are a real estate marketing copywriter. Create an engaging, natural language description for this property.

PROPERTY DETAILS:
- Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}
- Type: ${property.propertyType.replace('_', ' ')}
- Bedrooms: ${property.bedrooms || 'N/A'}
- Bathrooms: ${property.bathrooms || 'N/A'}
- Square Feet: ${property.squareFeet ? property.squareFeet.toLocaleString() : 'N/A'}
- Year Built: ${property.yearBuilt || 'N/A'}
- Lot Size: ${property.lotSize ? property.lotSize.toLocaleString() + ' sq ft' : 'N/A'}
- Purchase Price: ${property.purchasePrice ? '$' + property.purchasePrice.toLocaleString() : 'N/A'}

Create a compelling property description in the following JSON format:
{
  "description": "Engaging 2-3 paragraph description highlighting key features and appeal",
  "highlights": ["highlight1", "highlight2", "highlight3", "highlight4"],
  "sellingPoints": ["point1", "point2", "point3"],
  "targetAudience": "Description of ideal buyer/investor"
}

Make it professional, appealing, and focused on investment potential and property features.`;
}

